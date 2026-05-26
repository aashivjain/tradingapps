import { useState } from 'react'
import { motion } from 'framer-motion'

export default function TradePanel({
  stocks,
  selectedStock,
  setSelectedStock,
  currentPrice,
  onPlaceOrder,
  availableCash,
  selectedQuantity,
  bestBid,
  bestAsk,
}) {
  const [quantity, setQuantity] = useState(1)
  const [limitPrice, setLimitPrice] = useState(currentPrice)
  const orderValue = quantity * limitPrice

  return (
    <motion.div
      className="card border-2 border-neon-cyan"
      whileHover={{ boxShadow: '0 0 24px rgba(95, 168, 255, 0.24)' }}
    >
      <h2 className="text-2xl font-bold mb-6 text-neon-cyan">Place Limit Order</h2>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-text-secondary mb-2">Select Stock</label>
        <select
          value={selectedStock.symbol}
          onChange={(e) => {
            const stock = stocks.find(s => s.symbol === e.target.value)
            setSelectedStock(stock)
            setQuantity(1)
            setLimitPrice(currentPrice)
          }}
          className="w-full bg-dark-charcoal border border-dark-secondary rounded px-4 py-2 text-text-primary focus:outline-none focus:border-neon-cyan transition-smooth"
        >
          {stocks.map(stock => (
            <option key={stock.symbol} value={stock.symbol}>
              {stock.symbol}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-dark-charcoal rounded p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-text-secondary">Last Price</span>
          <span className="text-neon-lime font-bold text-lg">${Number(currentPrice || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Best Bid / Ask</span>
          <span className="text-neon-cyan">
            {bestBid ? `$${bestBid.toFixed(2)}` : '—'} / {bestAsk ? `$${bestAsk.toFixed(2)}` : '—'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full bg-dark-charcoal border border-dark-secondary rounded px-4 py-2 text-text-primary focus:outline-none focus:border-neon-cyan transition-smooth"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-secondary mb-2">Limit Price</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={Number.isFinite(limitPrice) ? limitPrice : currentPrice}
            onChange={(e) => setLimitPrice(Math.max(0.01, Number(e.target.value) || currentPrice))}
            className="w-full bg-dark-charcoal border border-dark-secondary rounded px-4 py-2 text-text-primary focus:outline-none focus:border-neon-cyan transition-smooth"
          />
        </div>
      </div>

      <div className="bg-dark-charcoal rounded p-4 mb-6">
        <div className="flex justify-between mb-3 text-sm">
          <span className="text-text-secondary">Order Notional</span>
          <span className="text-neon-magenta font-semibold">${orderValue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-3 text-sm">
          <span className="text-text-secondary">Available Cash</span>
          <span className={availableCash >= orderValue ? 'text-neon-lime' : 'text-neon-magenta'}>
            ${availableCash.toFixed(2)}
          </span>
        </div>
        <div className="h-px bg-dark-secondary my-3"></div>
        <div className="flex justify-between">
          <span className="text-text-secondary text-sm">Available Shares</span>
          <span className="text-neon-lime font-bold">
            {selectedQuantity}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onPlaceOrder('BUY', quantity, Number(limitPrice))}
          disabled={availableCash < orderValue}
          className="flex-1 btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed font-bold"
        >
          Place Bid
        </button>
        <button
          onClick={() => onPlaceOrder('SELL', quantity, Number(limitPrice))}
          disabled={selectedQuantity < quantity}
          className="flex-1 btn btn-tertiary disabled:opacity-50 disabled:cursor-not-allowed font-bold"
        >
          Place Ask
        </button>
      </div>

      {selectedQuantity > 0 && (
        <div className="mt-6 pt-6 border-t border-dark-secondary">
          <p className="text-sm text-text-secondary mb-2">Your Holdings</p>
          <p className="text-lg font-bold text-neon-lime">{selectedQuantity} shares</p>
        </div>
      )}
    </motion.div>
  )
}
