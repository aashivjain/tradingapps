import { create } from 'zustand'

const INITIAL_CASH = 100000
const BOT_CASH = 150000
const MAX_RECENT_TRADES = 40
const STARTER_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']
const BOT_IDS = ['bot-maker', 'bot-momentum', 'bot-reversion']

const createOrderId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const createTradeId = () => `trade-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const createInitialParticipant = (id, name, cash = INITIAL_CASH, starterQty = 0) => {
  const stocks = {}
  STARTER_SYMBOLS.forEach(symbol => {
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

const createInitialOrderBooks = symbols => {
  const books = {}
  symbols.forEach(symbol => {
    books[symbol] = {
      bids: [],
      asks: [],
    }
  })
  return books
}

const getAvailableShares = (participant, symbol) => {
  const held = participant.stocks[symbol] || 0
  const reserved = participant.reservedStocks[symbol] || 0
  return held - reserved
}

const sortBids = bids => bids.slice().sort((a, b) => {
  if (b.price !== a.price) {
    return b.price - a.price
  }
  return a.timestamp - b.timestamp
})

const sortAsks = asks => asks.slice().sort((a, b) => {
  if (a.price !== b.price) {
    return a.price - b.price
  }
  return a.timestamp - b.timestamp
})

const sumPortfolioValue = (participant, lastPrices) => {
  const stockValue = Object.entries(participant.stocks).reduce((acc, [symbol, qty]) => {
    const px = lastPrices[symbol] || 0
    return acc + qty * px
  }, 0)
  return participant.cash + stockValue
}

export const useTradeStore = create((set, get) => ({
  participants: {
    you: createInitialParticipant('you', 'You', INITIAL_CASH, 0),
    'bot-maker': createInitialParticipant('bot-maker', 'Maker Bot', BOT_CASH, 120),
    'bot-momentum': createInitialParticipant('bot-momentum', 'Momentum Bot', BOT_CASH, 120),
    'bot-reversion': createInitialParticipant('bot-reversion', 'Reversion Bot', BOT_CASH, 120),
  },
  orderBooks: createInitialOrderBooks(STARTER_SYMBOLS),
  recentTrades: [],
  marketPrices: {},

  setMarketPrice: (symbol, price) => {
    if (!symbol || !Number.isFinite(price) || price <= 0) {
      return
    }

    set(state => ({
      ...state,
      marketPrices: {
        ...state.marketPrices,
        [symbol]: price,
      },
    }))
  },

  getUserPortfolio: () => {
    const state = get()
    return state.participants.you
  },

  getOpenOrdersForSymbol: (symbol) => {
    const state = get()
    const book = state.orderBooks[symbol] || { bids: [], asks: [] }
    return {
      bids: book.bids,
      asks: book.asks,
    }
  },

  getUserOpenOrders: () => {
    const state = get()
    const orders = []
    Object.values(state.orderBooks).forEach(book => {
      book.bids.forEach(order => {
        if (order.traderId === 'you') {
          orders.push(order)
        }
      })
      book.asks.forEach(order => {
        if (order.traderId === 'you') {
          orders.push(order)
        }
      })
    })

    return orders.sort((a, b) => b.timestamp - a.timestamp)
  },

  cancelOrder: (orderId, traderId = 'you') => {
    if (!orderId) {
      return false
    }

    set(state => {
      const participants = { ...state.participants }
      const participant = participants[traderId]
      if (!participant) {
        return state
      }

      const orderBooks = { ...state.orderBooks }
      let cancelled = null

      Object.entries(orderBooks).forEach(([symbol, book]) => {
        const updatedBook = { ...book }

        updatedBook.bids = book.bids.filter(order => {
          const match = order.id === orderId && order.traderId === traderId
          if (match) {
            cancelled = { ...order, symbol }
          }
          return !match
        })

        updatedBook.asks = book.asks.filter(order => {
          const match = order.id === orderId && order.traderId === traderId
          if (match) {
            cancelled = { ...order, symbol }
          }
          return !match
        })

        orderBooks[symbol] = updatedBook
      })

      if (!cancelled) {
        return state
      }

      if (cancelled.side === 'BUY') {
        participant.reservedCash = Math.max(0, participant.reservedCash - (cancelled.remaining * cancelled.price))
      } else {
        const reserved = participant.reservedStocks[cancelled.symbol] || 0
        participant.reservedStocks = {
          ...participant.reservedStocks,
          [cancelled.symbol]: Math.max(0, reserved - cancelled.remaining),
        }
      }

      participants[traderId] = participant

      return {
        ...state,
        participants,
        orderBooks,
      }
    })

    return true
  },

  placeLimitOrder: ({ symbol, side, quantity, price, traderId = 'you' }) => {
    if (!symbol || !['BUY', 'SELL'].includes(side)) {
      return { ok: false, reason: 'Invalid order side or symbol' }
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { ok: false, reason: 'Quantity must be a positive integer' }
    }

    if (!Number.isFinite(price) || price <= 0) {
      return { ok: false, reason: 'Limit price must be positive' }
    }

    const state = get()
    const participant = state.participants[traderId]
    if (!participant) {
      return { ok: false, reason: 'Trader account not found' }
    }

    const orderValue = quantity * price
    const availableCash = participant.cash - participant.reservedCash
    const availableShares = getAvailableShares(participant, symbol)

    if (side === 'BUY' && availableCash < orderValue) {
      return { ok: false, reason: 'Insufficient available cash for limit buy' }
    }

    if (side === 'SELL' && availableShares < quantity) {
      return { ok: false, reason: 'Insufficient available shares for limit sell' }
    }

    set(state => {

      const participants = { ...state.participants }
      const buyerOrSeller = { ...participants[traderId] }
      buyerOrSeller.stocks = { ...buyerOrSeller.stocks }
      buyerOrSeller.reservedStocks = { ...buyerOrSeller.reservedStocks }
      participants[traderId] = buyerOrSeller

      const book = state.orderBooks[symbol] || { bids: [], asks: [] }
      const orderBooks = { ...state.orderBooks }
      const bids = book.bids.slice()
      const asks = book.asks.slice()

      const incoming = {
        id: createOrderId(),
        traderId,
        symbol,
        side,
        price,
        quantity,
        remaining: quantity,
        timestamp: Date.now(),
      }

      if (side === 'BUY') {
        buyerOrSeller.reservedCash += orderValue
      } else {
        const reserved = buyerOrSeller.reservedStocks[symbol] || 0
        buyerOrSeller.reservedStocks[symbol] = reserved + quantity
      }

      const trades = state.recentTrades.slice()

      const matchAgainstBook = () => {
        const opposite = incoming.side === 'BUY' ? asks : bids

        while (incoming.remaining > 0 && opposite.length > 0) {
          const resting = opposite[0]
          const crossed = incoming.side === 'BUY'
            ? incoming.price >= resting.price
            : incoming.price <= resting.price

          if (!crossed) {
            break
          }

          if (resting.traderId === incoming.traderId) {
            break
          }

          const fillQty = Math.min(incoming.remaining, resting.remaining)
          const tradePrice = resting.price

          const buyOrder = incoming.side === 'BUY' ? incoming : resting
          const sellOrder = incoming.side === 'SELL' ? incoming : resting
          const buyer = { ...participants[buyOrder.traderId] }
          const seller = { ...participants[sellOrder.traderId] }

          buyer.stocks = { ...buyer.stocks }
          buyer.reservedStocks = { ...buyer.reservedStocks }
          seller.stocks = { ...seller.stocks }
          seller.reservedStocks = { ...seller.reservedStocks }

          buyer.reservedCash = Math.max(0, buyer.reservedCash - (fillQty * buyOrder.price))
          buyer.cash -= fillQty * tradePrice
          buyer.stocks[symbol] = (buyer.stocks[symbol] || 0) + fillQty

          const sellerReserved = seller.reservedStocks[symbol] || 0
          seller.reservedStocks[symbol] = Math.max(0, sellerReserved - fillQty)
          seller.stocks[symbol] = (seller.stocks[symbol] || 0) - fillQty
          seller.cash += fillQty * tradePrice

          participants[buyer.id] = buyer
          participants[seller.id] = seller

          incoming.remaining -= fillQty
          resting.remaining -= fillQty

          trades.unshift({
            id: createTradeId(),
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
      }

      if (incoming.side === 'BUY') {
        asks.sort((a, b) => (a.price !== b.price ? a.price - b.price : a.timestamp - b.timestamp))
      } else {
        bids.sort((a, b) => (b.price !== a.price ? b.price - a.price : a.timestamp - b.timestamp))
      }

      matchAgainstBook()

      if (incoming.remaining > 0) {
        if (incoming.side === 'BUY') {
          bids.push(incoming)
        } else {
          asks.push(incoming)
        }
      }

      const finalBids = sortBids(bids)
      const finalAsks = sortAsks(asks)

      orderBooks[symbol] = {
        bids: finalBids,
        asks: finalAsks,
      }

      const trimmedTrades = trades.slice(0, MAX_RECENT_TRADES)

      return {
        ...state,
        participants,
        orderBooks,
        recentTrades: trimmedTrades,
      }
    })

    return { ok: true }
  },

  runBots: (symbols) => {
    const state = get()
    const targetSymbols = Array.isArray(symbols) && symbols.length > 0 ? symbols : STARTER_SYMBOLS

    BOT_IDS.forEach(botId => {
      targetSymbols.forEach(symbol => {
        const referencePrice = state.marketPrices[symbol]
        if (!Number.isFinite(referencePrice) || referencePrice <= 0) {
          return
        }

        const jitter = 1 + ((Math.random() - 0.5) * 0.008)
        const mid = referencePrice * jitter
        const size = 1 + Math.floor(Math.random() * 8)

        if (botId === 'bot-maker') {
          const spread = mid * 0.003
          get().placeLimitOrder({ symbol, side: 'BUY', quantity: size, price: Number((mid - spread).toFixed(2)), traderId: botId })
          get().placeLimitOrder({ symbol, side: 'SELL', quantity: size, price: Number((mid + spread).toFixed(2)), traderId: botId })
          return
        }

        if (botId === 'bot-momentum') {
          const side = Math.random() > 0.45 ? 'BUY' : 'SELL'
          const offset = side === 'BUY' ? 0.0025 : -0.0025
          const px = Number((mid * (1 + offset)).toFixed(2))
          get().placeLimitOrder({ symbol, side, quantity: size, price: px, traderId: botId })
          return
        }

        const side = Math.random() > 0.5 ? 'BUY' : 'SELL'
        const offset = side === 'BUY' ? -0.003 : 0.003
        const px = Number((mid * (1 + offset)).toFixed(2))
        get().placeLimitOrder({ symbol, side, quantity: size, price: px, traderId: botId })
      })
    })
  },

  reset: () => {
    set({
      participants: {
        you: createInitialParticipant('you', 'You', INITIAL_CASH, 0),
        'bot-maker': createInitialParticipant('bot-maker', 'Maker Bot', BOT_CASH, 120),
        'bot-momentum': createInitialParticipant('bot-momentum', 'Momentum Bot', BOT_CASH, 120),
        'bot-reversion': createInitialParticipant('bot-reversion', 'Reversion Bot', BOT_CASH, 120),
      },
      orderBooks: createInitialOrderBooks(STARTER_SYMBOLS),
      recentTrades: [],
      marketPrices: {},
    })
  },

  getPortfolioValue: () => {
    const state = get()
    return sumPortfolioValue(state.participants.you, state.marketPrices)
  },

  getUserAvailableCash: () => {
    const state = get()
    const user = state.participants.you
    return user.cash - user.reservedCash
  },
}))
