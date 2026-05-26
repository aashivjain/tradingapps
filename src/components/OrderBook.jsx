import { motion } from 'framer-motion'

export default function OrderBook({ symbol, book, trades, yourOrders, onCancelOrder }) {
  const topBids = (book?.bids || []).slice(0, 10)
  const topAsks = (book?.asks || []).slice(0, 10)
  const recentTrades = (trades || []).slice(0, 12)
  const symbolOrders = (yourOrders || []).filter(order => order.symbol === symbol).slice(0, 8)

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-neon-magenta">Order Book: {symbol}</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-charcoal rounded-xl border border-neon-lime/30 p-4">
          <h3 className="font-semibold text-neon-lime mb-3">Bids</h3>
          {topBids.length === 0 ? (
            <p className="text-sm text-text-secondary">No resting bids</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {topBids.map(row => (
                <div key={row.id} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{row.remaining}</span>
                  <span className="font-semibold text-neon-lime">${row.price.toFixed(2)}</span>
                  <span className="text-text-muted">{row.traderId === 'you' ? 'You' : row.traderId}</span>
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
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {topAsks.map(row => (
                <div key={row.id} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{row.remaining}</span>
                  <span className="font-semibold text-neon-magenta">${row.price.toFixed(2)}</span>
                  <span className="text-text-muted">{row.traderId === 'you' ? 'You' : row.traderId}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-dark-charcoal rounded-xl border border-dark-secondary p-4">
          <h3 className="font-semibold text-text-primary mb-3">Recent Prints</h3>
          {recentTrades.length === 0 ? (
            <p className="text-sm text-text-secondary">No fills yet</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {recentTrades.map(fill => (
                <div key={fill.id} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{fill.quantity}</span>
                  <span className="font-semibold text-neon-cyan">${fill.price.toFixed(2)}</span>
                  <span className="text-text-muted">{new Date(fill.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-dark-charcoal rounded-xl border border-dark-secondary p-4">
          <h3 className="font-semibold text-text-primary mb-3">Your Open Orders</h3>
          {symbolOrders.length === 0 ? (
            <p className="text-sm text-text-secondary">No open orders for this symbol</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {symbolOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between text-sm gap-2">
                  <div>
                    <p className={order.side === 'BUY' ? 'text-neon-lime font-semibold' : 'text-neon-magenta font-semibold'}>
                      {order.side} {order.remaining}
                    </p>
                    <p className="text-text-muted">@ ${order.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => onCancelOrder(order.id)}
                    className="btn btn-outline px-3 py-1 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
