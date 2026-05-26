import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { usePeerExchangeSocket } from '../hooks/usePeerExchangeSocket'

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

  const topBids = useMemo(() => book.bids.slice(0, 10), [book.bids])
  const topAsks = useMemo(() => book.asks.slice(0, 10), [book.asks])
  const symbolTrades = useMemo(() => trades.filter(item => item.symbol === symbol).slice(0, 12), [trades, symbol])
  const symbolOrders = useMemo(() => yourOpenOrders.filter(item => item.symbol === symbol).slice(0, 10), [yourOpenOrders, symbol])

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
          <p className="text-text-secondary mb-4">Shared central order book over WebSockets. Orders rest until crossed by another trader or bot.</p>

          <div className="flex flex-wrap gap-3 items-center">
            <span className={`text-sm font-semibold ${connected ? 'text-neon-lime' : 'text-neon-magenta'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
            <span className="text-sm text-text-secondary">Active traders: {connectedTraders}</span>
            <button
              onClick={() => setBotsEnabled(!botsEnabled)}
              className={`btn ${botsEnabled ? 'btn-secondary' : 'btn-outline'} px-4 py-1 text-sm`}
            >
              {botsEnabled ? 'Bots ON' : 'Bots OFF'}
            </button>
          </div>

          {error && <p className="mt-3 text-neon-magenta text-sm font-semibold">{error}</p>}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div className="card lg:col-span-1" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-5 text-neon-cyan">Trader Controls</h2>

            <div className="mb-5">
              <label className="block text-sm text-text-secondary mb-2">Display Name</label>
              <div className="flex gap-2">
                <input
                  value={nameInput}
                  onChange={event => setNameInput(event.target.value)}
                  placeholder="Set your trader name"
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

          <motion.div className="card lg:col-span-2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-5 text-neon-magenta">{symbol} Shared Book</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-dark-charcoal rounded-xl border border-neon-lime/30 p-4">
                <h3 className="font-semibold text-neon-lime mb-3">Bids</h3>
                {topBids.length === 0 ? (
                  <p className="text-sm text-text-secondary">No resting bids</p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {topBids.map(row => (
                      <div key={row.id} className="flex justify-between text-sm">
                        <span>{row.remaining}</span>
                        <span className="font-semibold text-neon-lime">${row.price.toFixed(2)}</span>
                        <span className="text-text-muted">{row.traderLabel}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-dark-charcoal rounded-xl border border-neon-magenta/30 p-4">
                <h3 className="font-semibold text-neon-magenta mb-3">Asks</h3>
                {topAsks.length === 0 ? (
                  <p className="text-sm text-text-secondary">No resting asks</p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {topAsks.map(row => (
                      <div key={row.id} className="flex justify-between text-sm">
                        <span>{row.remaining}</span>
                        <span className="font-semibold text-neon-magenta">${row.price.toFixed(2)}</span>
                        <span className="text-text-muted">{row.traderLabel}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark-charcoal rounded-xl border border-dark-secondary p-4">
                <h3 className="font-semibold text-text-primary mb-3">Recent Prints</h3>
                {symbolTrades.length === 0 ? (
                  <p className="text-sm text-text-secondary">No trades yet</p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {symbolTrades.map(fill => (
                      <div key={fill.id} className="flex justify-between text-sm">
                        <span>{fill.quantity}</span>
                        <span className="text-neon-cyan font-semibold">${fill.price.toFixed(2)}</span>
                        <span className="text-text-muted">{new Date(fill.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-dark-charcoal rounded-xl border border-dark-secondary p-4">
                <h3 className="font-semibold text-text-primary mb-3">Your Open Orders</h3>
                {symbolOrders.length === 0 ? (
                  <p className="text-sm text-text-secondary">No open orders</p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {symbolOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between text-sm gap-2">
                        <div>
                          <p className={order.side === 'BUY' ? 'text-neon-lime font-semibold' : 'text-neon-magenta font-semibold'}>
                            {order.side} {order.remaining}
                          </p>
                          <p className="text-text-muted">@ ${order.price.toFixed(2)}</p>
                        </div>
                        <button className="btn btn-outline px-3 py-1 text-xs" onClick={() => cancelOrder(order.id)}>
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
