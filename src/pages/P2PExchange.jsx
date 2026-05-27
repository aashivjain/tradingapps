import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { usePeerExchangeSocket } from '../hooks/usePeerExchangeSocket'
import OrderBook from '../components/OrderBook'

export default function P2PExchange() {
  const [nameInput, setNameInput] = useState('')
  const [selectedSymbol, setSelectedSymbol] = useState('ORBIT')
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState(100)

  const {
    connected,
    error,
    symbols,
    books,
    trades,
    lastPrices,
    botsEnabled,
    connectedTraders,
    you,
    yourOpenOrders,
    placeOrder,
    cancelOrder,
    setBotsEnabled,
    setName,
  } = usePeerExchangeSocket()

  const activeSymbols = symbols.length > 0 ? symbols : ['ORBIT', 'NOVA', 'BYTE', 'ECHO', 'DRIFT']
  const symbol = activeSymbols.includes(selectedSymbol) ? selectedSymbol : activeSymbols[0]
  const currentPrice = Number(lastPrices[symbol] || 0)
  const book = books[symbol] || { bids: [], asks: [] }

  const symbolTrades = useMemo(() => trades.filter(item => item.symbol === symbol).slice(0, 20), [trades, symbol])

  const availableCash = Math.max(0, Number((you?.cash || 0) - (you?.reservedCash || 0)))
  const shares = Number(you?.stocks?.[symbol] || 0)

  const submitOrder = side => {
    placeOrder({
      symbol,
      side,
      quantity: Number(quantity),
      price: Number(price),
    })
  }

  return (
    <div className="min-h-screen bg-dark-navy text-text-primary px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">Peer Exchange</h1>
          <p className="text-text-secondary mb-4">Shared order book over WebSockets. Orders stay open until another trader or bot matches them.</p>

          <div className="flex flex-wrap gap-3 items-center">
            <span className={`text-sm font-semibold ${connected ? 'text-neon-lime' : 'text-neon-magenta'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
            <span className="text-sm text-text-secondary">Active traders: {connectedTraders}</span>
            <button
              onClick={() => setBotsEnabled(!botsEnabled)}
              className={`btn ${botsEnabled ? 'btn-secondary' : 'btn-outline'} px-4 py-1 text-sm`}
            >
              {botsEnabled ? 'Bots: On' : 'Bots: Off'}
            </button>
          </div>

          {error && <p className="mt-3 text-neon-magenta text-sm font-semibold">{error}</p>}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div className="card lg:col-span-1" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-5 text-neon-cyan">Order Entry</h2>

            <div className="mb-5">
              <label className="block text-sm text-text-secondary mb-2">Display Name</label>
              <div className="flex gap-2">
                <input
                  value={nameInput}
                  onChange={event => setNameInput(event.target.value)}
                  placeholder="Enter display name"
                  className="w-full bg-dark-charcoal border border-dark-secondary rounded px-3 py-2"
                />
                <button className="btn btn-outline px-3 py-2" onClick={() => setName(nameInput)}>Save</button>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm text-text-secondary mb-2">Instrument</label>
              <select
                value={symbol}
                onChange={event => {
                  const nextSymbol = event.target.value
                  setSelectedSymbol(nextSymbol)
                  const nextPrice = Number(lastPrices[nextSymbol] || 1)
                  setPrice(Number(nextPrice.toFixed(2)))
                }}
                className="w-full bg-dark-charcoal border border-dark-secondary rounded px-3 py-2"
              >
                {activeSymbols.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={event => setQuantity(Math.max(1, Number.parseInt(event.target.value, 10) || 1))}
                  className="w-full bg-dark-charcoal border border-dark-secondary rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Limit Price</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={event => setPrice(Math.max(0.01, Number(event.target.value) || 0.01))}
                  className="w-full bg-dark-charcoal border border-dark-secondary rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="bg-dark-charcoal rounded-lg p-3 mb-4 border border-dark-secondary">
              <p className="text-sm text-text-secondary">Last Price: <span className="text-neon-cyan font-semibold">${currentPrice.toFixed(2)}</span></p>
              <p className="text-sm text-text-secondary">Available Cash: <span className="text-neon-lime font-semibold">${availableCash.toFixed(2)}</span></p>
              <p className="text-sm text-text-secondary">Available {symbol}: <span className="text-neon-magenta font-semibold">{shares}</span></p>
            </div>

            <div className="flex gap-3">
              <button className="btn btn-secondary flex-1" onClick={() => submitOrder('BUY')}>Place Bid</button>
              <button className="btn btn-tertiary flex-1" onClick={() => submitOrder('SELL')}>Place Ask</button>
            </div>
          </motion.div>

          <motion.div className="card lg:col-span-2 space-y-6" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}>

            {/* Holdings panel */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-neon-lime">My Position</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-dark-charcoal rounded-lg p-3 border border-dark-secondary">
                  <p className="text-xs text-text-secondary mb-1">Available Cash</p>
                  <p className="text-lg font-bold text-neon-cyan">${availableCash.toFixed(2)}</p>
                </div>
                <div className="bg-dark-charcoal rounded-lg p-3 border border-dark-secondary">
                  <p className="text-xs text-text-secondary mb-1">Reserved (open orders)</p>
                  <p className="text-lg font-bold text-neon-magenta">${Number(you?.reservedCash || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {activeSymbols.map(sym => {
                  const qty = Number(you?.stocks?.[sym] || 0)
                  const px = Number(lastPrices[sym] || 0)
                  const value = qty * px
                  const isSelected = sym === symbol
                  return (
                    <button
                      key={sym}
                      onClick={() => {
                        setSelectedSymbol(sym)
                        setPrice(Number(px.toFixed(2)))
                      }}
                      className={`bg-dark-charcoal rounded-lg p-3 text-left border transition-smooth ${isSelected ? 'border-neon-cyan' : 'border-dark-secondary hover:border-neon-cyan/40'}`}
                    >
                      <p className={`text-xs font-bold mb-1 ${isSelected ? 'text-neon-cyan' : 'text-text-secondary'}`}>{sym}</p>
                      <p className="text-base font-bold text-text-primary">{qty} <span className="text-xs font-normal text-text-muted">shrs</span></p>
                      <p className="text-xs text-text-muted">${px.toFixed(2)}</p>
                      {value > 0 && <p className="text-xs text-neon-lime font-semibold">${value.toFixed(0)}</p>}
                    </button>
                  )
                })}
              </div>
            </div>

            <OrderBook
              symbol={symbol}
              book={book}
              trades={symbolTrades}
              yourOrders={yourOpenOrders}
              onCancelOrder={cancelOrder}
              myTraderId={you?.id || ''}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
