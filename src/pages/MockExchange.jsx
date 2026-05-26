import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTradeStore } from '../stores/tradeStore'
import TradePanel from '../components/TradePanel'
import Portfolio from '../components/Portfolio'
import OrderBook from '../components/OrderBook'
import PnLDisplay from '../components/PnLDisplay'
import { fetchQuotes } from '../utils/marketData'

const TRACKED_SYMBOLS = [
  { symbol: 'AAPL', price: 150.25, change: 2.5 },
  { symbol: 'GOOGL', price: 140.80, change: -1.2 },
  { symbol: 'MSFT', price: 380.50, change: 3.1 },
  { symbol: 'TSLA', price: 250.00, change: -2.3 },
  { symbol: 'AMZN', price: 180.75, change: 1.8 },
]

const INITIAL_CASH = 100000

export default function MockExchange() {
  const [stocks, setStocks] = useState(TRACKED_SYMBOLS)
  const [selectedStock, setSelectedStock] = useState(TRACKED_SYMBOLS[0])
  const [prices, setPrices] = useState({})
  const [statusMessage, setStatusMessage] = useState('Fetching quotes via local server...')
  const [orderError, setOrderError] = useState('')
  const [botsEnabled, setBotsEnabled] = useState(true)

  const participants = useTradeStore(state => state.participants)
  const orderBooks = useTradeStore(state => state.orderBooks)
  const recentTrades = useTradeStore(state => state.recentTrades)
  const placeLimitOrder = useTradeStore(state => state.placeLimitOrder)
  const cancelOrder = useTradeStore(state => state.cancelOrder)
  const runBots = useTradeStore(state => state.runBots)
  const setMarketPrice = useTradeStore(state => state.setMarketPrice)

  const user = participants.you
  const selectedBook = orderBooks[selectedStock.symbol] || { bids: [], asks: [] }
  const bestBid = selectedBook.bids[0]?.price || null
  const bestAsk = selectedBook.asks[0]?.price || null
  const yourOrders = Object.values(orderBooks)
    .flatMap(book => [...book.bids, ...book.asks])
    .filter(order => order.traderId === 'you')
    .sort((a, b) => b.timestamp - a.timestamp)

  useEffect(() => {
    const initialPrices = {}
    stocks.forEach(stock => {
      initialPrices[stock.symbol] = stock.price
      setMarketPrice(stock.symbol, stock.price)
    })
    setPrices(initialPrices)
  }, [setMarketPrice, stocks])

  useEffect(() => {
    let mounted = true

    const refreshQuotes = async () => {
      try {
        const symbols = stocks.map(item => item.symbol)
        const quoteMap = await fetchQuotes(symbols)
        if (!mounted || Object.keys(quoteMap).length === 0) {
          return
        }

        setStocks(prevStocks => prevStocks.map(stock => {
          const quote = quoteMap[stock.symbol]
          if (!quote) {
            return stock
          }
          return {
            ...stock,
            price: quote.price,
            change: quote.changePercent,
          }
        }))

        setPrices(prev => {
          const next = { ...prev }
          Object.entries(quoteMap).forEach(([symbol, quote]) => {
            next[symbol] = quote.price
            setMarketPrice(symbol, quote.price)
          })
          return next
        })

        setStatusMessage('Quotes via Yahoo Finance (proxied locally)')
      } catch (error) {
        setStatusMessage(`Market data unavailable: ${error.message} — is npm run server running?`)
      }
    }

    refreshQuotes()
    const interval = setInterval(refreshQuotes, 15000)

    return () => clearInterval(interval)
  }, [setMarketPrice, stocks])

  useEffect(() => {
    if (!botsEnabled) {
      return undefined
    }

    const interval = setInterval(() => {
      runBots(stocks.map(item => item.symbol))
    }, 4000)

    return () => clearInterval(interval)
  }, [botsEnabled, runBots, stocks])

  const calculatePortfolioValue = () => {
    let totalValue = user.cash
    Object.entries(user.stocks).forEach(([symbol, qty]) => {
      totalValue += qty * (prices[symbol] || 0)
    })
    return totalValue
  }

  const portfolioValue = calculatePortfolioValue()
  const totalPnL = portfolioValue - INITIAL_CASH

  const selectedTrades = recentTrades.filter(trade => trade.symbol === selectedStock.symbol)

  const handlePlaceOrder = (side, quantity, price) => {
    const result = placeLimitOrder({ symbol: selectedStock.symbol, side, quantity, price, traderId: 'you' })
    if (!result.ok) {
      setOrderError(result.reason)
      return
    }

    setOrderError('')
  }

  const availableCash = user.cash - user.reservedCash
  const userShares = user.stocks[selectedStock.symbol] || 0

  return (
    <div className="min-h-screen bg-dark-navy text-text-primary px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2">Mock Exchange</h1>
          <p className="text-text-secondary mb-3">Limit-order simulation with external quote updates. Orders fill only when another order crosses your limit price.</p>
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm text-text-secondary">{statusMessage}</span>
            <button
              onClick={() => setBotsEnabled(prev => !prev)}
              className={`btn ${botsEnabled ? 'btn-secondary' : 'btn-outline'} text-sm px-4 py-1`}
            >
              {botsEnabled ? 'Bots: On' : 'Bots: Off'}
            </button>
            <span className="text-xs text-text-muted">
              With bots off, orders generally remain resting when you are the only participant.
            </span>
          </div>
          {orderError && <p className="mt-3 text-sm text-neon-magenta font-semibold">{orderError}</p>}
        </motion.div>

        <motion.div
          className="grid md:grid-cols-4 gap-4 mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <PnLDisplay
            label="Portfolio Value"
            value={`$${portfolioValue.toFixed(2)}`}
            change={`${totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}`}
            color="cyan"
          />
          <PnLDisplay
            label="Available Cash"
            value={`$${availableCash.toFixed(2)}`}
            change="—"
            color="lime"
          />
          <PnLDisplay
            label="Total PnL"
            value={`$${totalPnL.toFixed(2)}`}
            change={`${totalPnL >= 0 ? '+' : ''}${((totalPnL / INITIAL_CASH) * 100).toFixed(2)}%`}
            color={totalPnL >= 0 ? 'lime' : 'magenta'}
          />
          <PnLDisplay
            label="Open Orders"
            value={yourOrders.length}
            change="—"
            color="purple"
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TradePanel
              stocks={stocks}
              selectedStock={selectedStock}
              setSelectedStock={setSelectedStock}
              currentPrice={prices[selectedStock.symbol] || 0}
              onPlaceOrder={handlePlaceOrder}
              availableCash={availableCash}
              selectedQuantity={userShares}
              bestBid={bestBid}
              bestAsk={bestAsk}
            />
          </motion.div>

          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Portfolio
              participant={user}
              prices={prices}
            />
            <OrderBook
              symbol={selectedStock.symbol}
              book={selectedBook}
              trades={selectedTrades}
              yourOrders={yourOrders}
              onCancelOrder={cancelOrder}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
