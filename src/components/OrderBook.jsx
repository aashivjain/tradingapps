import { motion } from 'framer-motion'

export default function OrderBook({ symbol, book, trades, yourOrders, onCancelOrder }) {
  const topBids = (book?.bids || []).slice(0, 8)
  const topAsks = (book?.asks || []).slice(0, 8)
  // Traditional ladder: asks displayed high→low (cheapest ask at bottom, nearest spread)
  const ladderAsks = [...topAsks].reverse()
  const recentTrades = (trades || []).slice(0, 12)
  const symbolOrders = (yourOrders || []).filter(order => order.symbol === symbol).slice(0, 8)

  const bestBid = topBids[0]?.price ?? null
  const bestAsk = topAsks[0]?.price ?? null
  const spread = bestBid != null && bestAsk != null ? (bestAsk - bestBid).toFixed(2) : null
  const mid = bestBid != null && bestAsk != null ? ((bestAsk + bestBid) / 2).toFixed(2) : null

  const colHeader = (
    <div className="grid grid-cols-3 text-xs text-text-secondary px-2 py-1 mb-1">
      <span>Size</span>
      <span className="text-center">Price</span>
      <span className="text-right">Who</span>
    </div>
  )

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-neon-magenta">Order Book: {symbol}</h2>

      {/* Price ladder */}
      <div className="bg-dark-charcoal rounded-xl border border-dark-secondary p-3 mb-6">
        {colHeader}

        {/* Asks — most expensive at top, cheapest nearest the spread */}
        {ladderAsks.length === 0 ? (
          <p className="text-sm text-text-secondary px-2 py-2">No resting asks</p>
        ) : (
          <div className="space-y-0.5 mb-1">
            {ladderAsks.map(row => (
              <div
                key={row.id}
                className={`grid grid-cols-3 text-sm px-2 py-0.5 rounded ${row.traderId === 'you' ? 'bg-neon-magenta/10' : ''}`}
              >
                <span className="text-text-secondary">{row.remaining}</span>
                <span className="font-semibold text-neon-magenta text-center">${row.price.toFixed(2)}</span>
                <span className="text-right text-xs text-text-muted">
                  {row.traderId === 'you' ? <span className="text-neon-magenta">You</span> : '·'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Spread row */}
        <div className="flex justify-between items-center border-y border-dark-secondary py-1.5 px-2 my-1 text-xs text-text-secondary">
          <span>Spread: {spread != null ? `$${spread}` : '—'}</span>
          <span>Mid: {mid != null ? `$${mid}` : '—'}</span>
        </div>

        {/* Bids — best bid at top, worst at bottom */}
        {topBids.length === 0 ? (
          <p className="text-sm text-text-secondary px-2 py-2">No resting bids</p>
        ) : (
          <div className="space-y-0.5 mt-1">
            {topBids.map(row => (
              <div
                key={row.id}
                className={`grid grid-cols-3 text-sm px-2 py-0.5 rounded ${row.traderId === 'you' ? 'bg-neon-lime/10' : ''}`}
              >
                <span className="text-text-secondary">{row.remaining}</span>
                <span className="font-semibold text-neon-lime text-center">${row.price.toFixed(2)}</span>
                <span className="text-right text-xs text-text-muted">
                  {row.traderId === 'you' ? <span className="text-neon-lime">You</span> : '·'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent prints */}
        <div className="bg-dark-charcoal rounded-xl border border-dark-secondary p-4">
          <h3 className="font-semibold text-text-primary mb-3 text-sm">Recent Fills</h3>
          <div className="grid grid-cols-3 text-xs text-text-secondary mb-1 px-1">
            <span>Size</span>
            <span className="text-center">Price</span>
            <span className="text-right">Time</span>
          </div>
          {recentTrades.length === 0 ? (
            <p className="text-sm text-text-secondary">No fills yet</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {recentTrades.map(fill => (
                <div key={fill.id} className="grid grid-cols-3 text-sm px-1">
                  <span className="text-text-secondary">{fill.quantity}</span>
                  <span className="font-semibold text-neon-cyan text-center">${fill.price.toFixed(2)}</span>
                  <span className="text-text-muted text-right text-xs">{new Date(fill.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your open orders */}
        <div className="bg-dark-charcoal rounded-xl border border-dark-secondary p-4">
          <h3 className="font-semibold text-text-primary mb-3 text-sm">Your Open Orders</h3>
          {symbolOrders.length === 0 ? (
            <p className="text-sm text-text-secondary">No open orders for {symbol}</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {symbolOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between text-sm gap-2">
                  <div>
                    <p className={order.side === 'BUY' ? 'text-neon-lime font-semibold' : 'text-neon-magenta font-semibold'}>
                      {order.side} {order.remaining} @ ${order.price.toFixed(2)}
                    </p>
                    <p className="text-text-muted text-xs">resting — waiting for counterparty</p>
                  </div>
                  <button
                    onClick={() => onCancelOrder(order.id)}
                    className="btn btn-outline px-3 py-1 text-xs shrink-0"
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

