import http from 'http'
import { WebSocketServer } from 'ws'
import YahooFinance from 'yahoo-finance2'

const PORT = Number(process.env.PORT || 8787)
const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] })
const SYMBOLS = ['ORBIT', 'NOVA', 'BYTE', 'ECHO', 'DRIFT']
const BOT_IDS = ['bot-maker', 'bot-momentum', 'bot-reversion']
const BOT_NAMES = {
  'bot-maker': 'Maker Bot',
  'bot-momentum': 'Momentum Bot',
  'bot-reversion': 'Reversion Bot',
}

const INITIAL_USER_CASH = 100000
const INITIAL_BOT_CASH = 200000
const MAX_TRADES = 80

const clients = new Map()
const participants = {}
const orderBooks = {}
const recentTrades = []
const lastPrices = {
  ORBIT: 102.5,
  NOVA: 88.2,
  BYTE: 64.4,
  ECHO: 143.1,
  DRIFT: 39.8,
}

let botsEnabled = false

const createId = (prefix = 'ord') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const createParticipant = (id, name, cash, starterQty = 0) => {
  const stocks = {}
  SYMBOLS.forEach(symbol => {
    stocks[symbol] = starterQty
  })

  return {
    id,
    name,
    cash,
    reservedCash: 0,
    stocks,
    reservedStocks: {},
  }
}

const ensureBooks = () => {
  SYMBOLS.forEach(symbol => {
    if (!orderBooks[symbol]) {
      orderBooks[symbol] = { bids: [], asks: [] }
    }
  })
}

const sortBids = bids => bids.sort((a, b) => {
  if (b.price !== a.price) {
    return b.price - a.price
  }
  return a.timestamp - b.timestamp
})

const sortAsks = asks => asks.sort((a, b) => {
  if (a.price !== b.price) {
    return a.price - b.price
  }
  return a.timestamp - b.timestamp
})

const getAvailableShares = (participant, symbol) => {
  const total = participant.stocks[symbol] || 0
  const reserved = participant.reservedStocks[symbol] || 0
  return total - reserved
}

const addTrade = trade => {
  recentTrades.unshift(trade)
  if (recentTrades.length > MAX_TRADES) {
    recentTrades.pop()
  }
}

const removeOrderFromBook = (orderId, traderId) => {
  let cancelledOrder = null

  Object.entries(orderBooks).forEach(([symbol, book]) => {
    book.bids = book.bids.filter(order => {
      const matched = order.id === orderId && order.traderId === traderId
      if (matched) {
        cancelledOrder = { ...order, symbol }
      }
      return !matched
    })

    book.asks = book.asks.filter(order => {
      const matched = order.id === orderId && order.traderId === traderId
      if (matched) {
        cancelledOrder = { ...order, symbol }
      }
      return !matched
    })
  })

  if (!cancelledOrder) {
    return false
  }

  const participant = participants[traderId]
  if (!participant) {
    return false
  }

  if (cancelledOrder.side === 'BUY') {
    participant.reservedCash = Math.max(0, participant.reservedCash - (cancelledOrder.remaining * cancelledOrder.price))
  } else {
    const held = participant.reservedStocks[cancelledOrder.symbol] || 0
    participant.reservedStocks[cancelledOrder.symbol] = Math.max(0, held - cancelledOrder.remaining)
  }

  return true
}

const cancelAllOrdersForTrader = traderId => {
  Object.values(orderBooks).forEach(book => {
    book.bids = book.bids.filter(order => order.traderId !== traderId)
    book.asks = book.asks.filter(order => order.traderId !== traderId)
  })
}

const placeLimitOrder = ({ traderId, symbol, side, quantity, price }) => {
  if (!participants[traderId]) {
    return { ok: false, reason: 'Trader not found' }
  }

  if (!SYMBOLS.includes(symbol)) {
    return { ok: false, reason: 'Unknown symbol' }
  }

  if (!['BUY', 'SELL'].includes(side)) {
    return { ok: false, reason: 'Invalid side' }
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, reason: 'Quantity must be positive integer' }
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, reason: 'Price must be positive' }
  }

  const trader = participants[traderId]
  const notional = quantity * price
  const availableCash = trader.cash - trader.reservedCash
  const availableShares = getAvailableShares(trader, symbol)

  if (side === 'BUY' && availableCash < notional) {
    return { ok: false, reason: 'Insufficient available cash' }
  }

  if (side === 'SELL' && availableShares < quantity) {
    return { ok: false, reason: 'Insufficient available shares' }
  }

  const book = orderBooks[symbol]
  const bids = [...book.bids]
  const asks = [...book.asks]

  const incoming = {
    id: createId('ord'),
    traderId,
    symbol,
    side,
    quantity,
    remaining: quantity,
    price,
    timestamp: Date.now(),
  }

  if (side === 'BUY') {
    trader.reservedCash += notional
  } else {
    trader.reservedStocks[symbol] = (trader.reservedStocks[symbol] || 0) + quantity
  }

  const opposite = side === 'BUY' ? asks : bids
  if (side === 'BUY') {
    sortAsks(opposite)
  } else {
    sortBids(opposite)
  }

  while (incoming.remaining > 0 && opposite.length > 0) {
    const resting = opposite[0]
    if (resting.traderId === traderId) {
      break
    }

    const crossed = incoming.side === 'BUY'
      ? incoming.price >= resting.price
      : incoming.price <= resting.price

    if (!crossed) {
      break
    }

    const fillQty = Math.min(incoming.remaining, resting.remaining)
    const tradePrice = Number(((incoming.price + resting.price) / 2).toFixed(2))

    const buyOrder = incoming.side === 'BUY' ? incoming : resting
    const sellOrder = incoming.side === 'SELL' ? incoming : resting

    const buyer = participants[buyOrder.traderId]
    const seller = participants[sellOrder.traderId]

    buyer.reservedCash = Math.max(0, buyer.reservedCash - (fillQty * buyOrder.price))
    buyer.cash -= fillQty * tradePrice
    buyer.stocks[symbol] = (buyer.stocks[symbol] || 0) + fillQty

    seller.reservedStocks[symbol] = Math.max(0, (seller.reservedStocks[symbol] || 0) - fillQty)
    seller.stocks[symbol] = (seller.stocks[symbol] || 0) - fillQty
    seller.cash += fillQty * tradePrice

    incoming.remaining -= fillQty
    resting.remaining -= fillQty
    lastPrices[symbol] = tradePrice

    addTrade({
      id: createId('trd'),
      symbol,
      quantity: fillQty,
      price: tradePrice,
      buyerId: buyer.id,
      sellerId: seller.id,
      timestamp: Date.now(),
    })

    if (resting.remaining <= 0) {
      opposite.shift()
    }
  }

  if (incoming.remaining > 0) {
    if (incoming.side === 'BUY') {
      bids.push(incoming)
    } else {
      asks.push(incoming)
    }
  }

  orderBooks[symbol] = {
    bids: sortBids(bids),
    asks: sortAsks(asks),
  }

  return { ok: true, orderId: incoming.id }
}

const runBots = () => {
  if (!botsEnabled) {
    return
  }

  BOT_IDS.forEach(botId => {
    SYMBOLS.forEach(symbol => {
      const reference = lastPrices[symbol]
      if (!Number.isFinite(reference) || reference <= 0) {
        return
      }

      const size = 1 + Math.floor(Math.random() * 7)
      const jitter = 1 + ((Math.random() - 0.5) * 0.006)
      const mid = reference * jitter

      if (botId === 'bot-maker') {
        const spread = mid * 0.0025
        placeLimitOrder({
          traderId: botId,
          symbol,
          side: 'BUY',
          quantity: size,
          price: Number((mid - spread).toFixed(2)),
        })
        placeLimitOrder({
          traderId: botId,
          symbol,
          side: 'SELL',
          quantity: size,
          price: Number((mid + spread).toFixed(2)),
        })
        return
      }

      if (botId === 'bot-momentum') {
        const side = Math.random() > 0.45 ? 'BUY' : 'SELL'
        const offset = side === 'BUY' ? 0.002 : -0.002
        placeLimitOrder({
          traderId: botId,
          symbol,
          side,
          quantity: size,
          price: Number((mid * (1 + offset)).toFixed(2)),
        })
        return
      }

      const side = Math.random() > 0.5 ? 'BUY' : 'SELL'
      const offset = side === 'BUY' ? -0.003 : 0.003
      placeLimitOrder({
        traderId: botId,
        symbol,
        side,
        quantity: size,
        price: Number((mid * (1 + offset)).toFixed(2)),
      })
    })
  })
}

const visibleOrder = (order, viewerId) => ({
  id: order.id,
  side: order.side,
  symbol: order.symbol,
  price: order.price,
  quantity: order.quantity,
  remaining: order.remaining,
  timestamp: order.timestamp,
  traderLabel: order.traderId === viewerId
    ? 'You'
    : participants[order.traderId]?.name || order.traderId,
  traderId: order.traderId,
})

const buildSnapshotFor = traderId => {
  const trader = participants[traderId]
  if (!trader) {
    return null
  }

  const books = {}
  Object.entries(orderBooks).forEach(([symbol, book]) => {
    books[symbol] = {
      bids: book.bids.slice(0, 30).map(order => visibleOrder(order, traderId)),
      asks: book.asks.slice(0, 30).map(order => visibleOrder(order, traderId)),
    }
  })

  const yourOpenOrders = []
  Object.values(orderBooks).forEach(book => {
    book.bids.forEach(order => {
      if (order.traderId === traderId) {
        yourOpenOrders.push(visibleOrder(order, traderId))
      }
    })
    book.asks.forEach(order => {
      if (order.traderId === traderId) {
        yourOpenOrders.push(visibleOrder(order, traderId))
      }
    })
  })

  yourOpenOrders.sort((a, b) => b.timestamp - a.timestamp)

  return {
    symbols: SYMBOLS,
    books,
    trades: recentTrades.slice(0, 60),
    lastPrices,
    botsEnabled,
    connectedTraders: [...clients.values()].length,
    you: trader,
    yourOpenOrders,
  }
}

const send = (ws, payload) => {
  if (ws.readyState !== 1) {
    return
  }
  ws.send(JSON.stringify(payload))
}

const broadcastSnapshots = () => {
  clients.forEach((traderId, ws) => {
    const snapshot = buildSnapshotFor(traderId)
    if (!snapshot) {
      return
    }
    send(ws, { type: 'snapshot', payload: snapshot })
  })
}

const initializeBots = () => {
  BOT_IDS.forEach(botId => {
    participants[botId] = createParticipant(botId, BOT_NAMES[botId], INITIAL_BOT_CASH, 300)
  })
}

const initialize = () => {
  ensureBooks()
  initializeBots()
}

initialize()

const httpServer = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const url = new URL(req.url, `http://localhost:${PORT}`)

  if (req.method === 'GET' && url.pathname === '/quotes') {
    const symbols = url.searchParams.get('symbols') || ''
    if (!symbols) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Missing symbols parameter' }))
      return
    }

    try {
      const results = await yf.quote(symbols.split(',').map(s => s.trim()).filter(Boolean))
      const quotes = {}

      const list = Array.isArray(results) ? results : [results]
      list.forEach(item => {
        if (item?.symbol && Number.isFinite(item.regularMarketPrice)) {
          quotes[item.symbol] = {
            price: item.regularMarketPrice,
            changePercent: item.regularMarketChangePercent ?? 0,
          }
        }
      })

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(quotes))
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err.message }))
    }
    return
  }

  res.writeHead(404)
  res.end()
})

const wss = new WebSocketServer({ server: httpServer })

wss.on('connection', ws => {
  const traderId = createId('trader')
  participants[traderId] = createParticipant(traderId, `Trader ${traderId.slice(-4)}`, INITIAL_USER_CASH, 0)
  clients.set(ws, traderId)

  send(ws, {
    type: 'welcome',
    payload: {
      traderId,
      message: 'Connected to local peer exchange',
      symbols: SYMBOLS,
    },
  })

  broadcastSnapshots()

  ws.on('message', raw => {
    let message
    try {
      message = JSON.parse(String(raw))
    } catch {
      send(ws, { type: 'error', payload: { message: 'Invalid JSON message' } })
      return
    }

    if (!message?.type) {
      send(ws, { type: 'error', payload: { message: 'Missing message type' } })
      return
    }

    const currentTraderId = clients.get(ws)
    if (!currentTraderId) {
      return
    }

    if (message.type === 'requestState') {
      const snapshot = buildSnapshotFor(currentTraderId)
      if (snapshot) {
        send(ws, { type: 'snapshot', payload: snapshot })
      }
      return
    }

    if (message.type === 'setName') {
      const nextName = String(message.payload?.name || '').trim()
      if (!nextName) {
        send(ws, { type: 'error', payload: { message: 'Name cannot be empty' } })
        return
      }
      participants[currentTraderId].name = nextName.slice(0, 24)
      broadcastSnapshots()
      return
    }

    if (message.type === 'setBots') {
      botsEnabled = Boolean(message.payload?.enabled)
      broadcastSnapshots()
      return
    }

    if (message.type === 'placeOrder') {
      const payload = message.payload || {}
      const result = placeLimitOrder({
        traderId: currentTraderId,
        symbol: payload.symbol,
        side: payload.side,
        quantity: Number(payload.quantity),
        price: Number(payload.price),
      })

      if (!result.ok) {
        send(ws, { type: 'error', payload: { message: result.reason } })
        return
      }

      broadcastSnapshots()
      return
    }

    if (message.type === 'cancelOrder') {
      const orderId = String(message.payload?.orderId || '')
      if (!orderId) {
        send(ws, { type: 'error', payload: { message: 'Missing order id' } })
        return
      }

      const cancelled = removeOrderFromBook(orderId, currentTraderId)
      if (!cancelled) {
        send(ws, { type: 'error', payload: { message: 'Order not found' } })
        return
      }

      broadcastSnapshots()
      return
    }

    send(ws, { type: 'error', payload: { message: `Unknown message type: ${message.type}` } })
  })

  ws.on('close', () => {
    const leavingTraderId = clients.get(ws)
    clients.delete(ws)

    if (!leavingTraderId) {
      return
    }

    cancelAllOrdersForTrader(leavingTraderId)
    delete participants[leavingTraderId]
    broadcastSnapshots()
  })
})

setInterval(() => {
  runBots()
  broadcastSnapshots()
}, 3000)

httpServer.listen(PORT, () => {
  console.log(`Exchange server running on port ${PORT}`)
  console.log(`  WebSocket: ws://localhost:${PORT}`)
  console.log(`  Quotes:    http://localhost:${PORT}/quotes?symbols=AAPL,MSFT`)
  console.log('Bots default to OFF. Toggle from the client UI when you want liquidity.')
})
