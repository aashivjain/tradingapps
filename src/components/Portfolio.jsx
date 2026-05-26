import { motion } from 'framer-motion'

export default function Portfolio({ participant, prices }) {
  const holdings = Object.entries(participant.stocks || {}).filter(([, quantity]) => quantity > 0).map(([symbol, quantity]) => ({
    symbol,
    quantity,
    price: prices[symbol] || 0,
    value: quantity * (prices[symbol] || 0)
  }))

  const availableCash = participant.cash - participant.reservedCash
  const netLiquidation = participant.cash + holdings.reduce((sum, h) => sum + h.value, 0)

  if (holdings.length === 0) {
    return (
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-neon-lime">Portfolio</h2>
        <div className="text-center py-12 text-text-secondary">
          <p className="text-lg">No holdings yet</p>
          <p className="text-sm mt-2">Start trading to build your portfolio</p>
        </div>
      </motion.div>
    )
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-neon-lime">Portfolio</h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-dark-charcoal rounded-lg p-3 border border-dark-secondary">
          <p className="text-xs text-text-secondary mb-1">Cash</p>
          <p className="text-lg font-bold text-neon-cyan">${participant.cash.toFixed(2)}</p>
        </div>
        <div className="bg-dark-charcoal rounded-lg p-3 border border-dark-secondary">
          <p className="text-xs text-text-secondary mb-1">Reserved Cash</p>
          <p className="text-lg font-bold text-neon-magenta">${participant.reservedCash.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {holdings.map((holding, idx) => (
          <motion.div
            key={holding.symbol}
            className="bg-dark-charcoal rounded p-4 flex justify-between items-center hover:border-neon-lime border border-dark-secondary transition-smooth"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <div>
              <p className="font-bold text-text-primary">{holding.symbol}</p>
              <p className="text-sm text-text-secondary">
                {holding.quantity} shares @ ${holding.price.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-neon-cyan">${holding.value.toFixed(2)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-dark-charcoal border-2 border-neon-lime rounded p-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-text-secondary">Holdings Value / Available Cash</span>
          <span className="text-2xl font-bold text-neon-lime">${totalValue.toFixed(2)} / ${availableCash.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-dark-charcoal border border-dark-secondary rounded p-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-text-secondary">Net Liquidation (Marked)</span>
          <span className="text-2xl font-bold text-neon-lime">${netLiquidation.toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  )
}
