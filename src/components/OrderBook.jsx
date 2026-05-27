import { motion } from 'framer-motion'

export default function OrderBook({ symbol, book, trades, yourOrders, onCancelOrder, myTraderId = 'you' }) {
  const topBids = (book?.bids || []).slice(0, 8)
  const topAsks = (book?.asks || []).slice(0, 8)
  const ladderAsks = [...topAsks].reverse()
  const allTrades = (trades || []).slice(0, 20)

  const isMe = row => row.traderId === myTraderId || row.traderLabel === 'You'

  const myFills = allTrades.filter(t => t.buyerId === myTraderId || t.sellerId === myTraderId)
  let boughtQty = 0, boughtValue = 0, soldQty = 0, soldValue = 0
  myFills.forEach(t => {
    if (t.buyerId === myTraderId) { boughtQty += t.quantity; boughtValue += t.quantity * t.price }
    if (t.sellerId === myTraderId) { soldQty += t.quantity; soldValue += t.quantity * t.price }
  })

  const ladderRow = (row, side) => {
    const mine = isMe(row)
    const priceColor = side === 'ask' ? 'text-neon-magenta' : 'text-neon-lime'
    const highlightBg = side === 'ask' ? 'bg-neon-magenta/10' : 'bg-neon-lime/10'
    return (
      <div
        key={row.id}
        className={`grid grid-cols-4 text-sm px-2 py-0.5 rounded items-center ${mine ? highlightBg : ''}`}
      >
        <span className="text-text-secondary">{row.remaining}</span>
        <span className={`font-semibold text-center ${priceColor}`}>${row.price.toFixed(2)}</span>
        <span className="text-center text-xs">
          {mine
            ? <span className={`font-semibold ${priceColor}`}>You</span>
            : <span className="text-text-muted">·</span>}
        </span>
        <span className="text-right">
          {mine && onCancelOrder && (
            <button
              onClick={() => onCancelOrder(row.id)}
              className="text-xs text-text-muted hover:text-neon-magenta transition-smooth px-1 py-0.5 rounded hover:bg-neon-magenta/10"
              title="Cancel order"
            >
              ×
            </button>
          )}
        </span>
      </div>
    )
  }

  const bestBid = topBids[0]?.price ?? null
  const bestAsk = topAsks[0]?.price ?? null
  const spread = bestBid != null && bestAsk != null ? (bestAsk - bestBid).toFixed(2) : null
  const mid = bestBid != null && bestAsk != null ? ((bestAsk + bestBid) / 2).toFixed(2) : null

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
        <div className="grid grid-cols-4 text-xs text-text-secondary px-2 py-1 mb-1">
          <span>Size</span>
          <span className="text-center">Price</span>
          <span className="text-center">Who</span>
          <span />
        </div>

        {ladderAsks.length === 0
          ? <p className="text-sm text-text-secondary px-2 py-2">No resting asks</p>
          : <div className="space-y-0.5 mb-1">{ladderAsks.map(row => ladderRow(row, 'ask'))}</div>}

        <div className="flex justify-between items-center border-y border-dark-secondary py-1.5 px-2 my-1 text-xs text-text-secondary">
          <span>Spread: {spread != null ? `$${spread}` : '—'}</span>
          <span>Mid: {mid != null ? `$${mid}` : '—'}</span>
        </div>

        {topBids.length === 0
          ? <p className="text-sm text-text-secondary px-2 py-2">No resting bids</p>
          : <div className="space-y-0.5 mt-1">{topBids.map(row => ladderRow(row, 'bid'))}</div>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent fills — your rows highlighted */}
        <div className="bg-dark-charcoal rounded-xl border border-dark-secondary p-4">
          <h3 className="font-semibold text-text-primary mb-3 text-sm">Recent Fills</h3>
          <div className="grid grid-cols-3 text-xs text-text-secondary mb-2 px-1">
            <span>Size</span>
            <span className="text-center">Price</span>
            <span className="text-right">Time</span>
          </div>
          {allTrades.length === 0 ? (
            <p className="text-sm text-text-secondary">No fills yet</p>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {allTrades.map(fill => {
                const mine = fill.buyerId === myTraderId || fill.sellerId === myTraderId
                return (
                  <div key={fill.id} className={`grid grid-cols-3 text-sm px-1 py-0.5 rounded ${mine ? 'bg-neon-cyan/10' : ''}`}>
                    <span className={mine ? 'text-neon-cyan font-semibold' : 'text-text-secondary'}>{fill.quantity}</span>
                    <span className="font-semibold text-neon-cyan text-center">${fill.price.toFixed(2)}</span>
                    <span className="text-text-muted text-right text-xs">{new Date(fill.timestamp).toLocaleTimeString()}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* My activity — fill history + running totals */}
        <div className="bg-dark-charcoal rounded-xl border border-dark-secondary p-4">
          <h3 className="font-semibold text-text-primary mb-3 text-sm">My Activity — {symbol}</h3>
          {myFills.length === 0 ? (
            <p className="text-sm text-text-secondary">No fills yet for {symbol}</p>
          ) : (
            <>
              <div className="space-y-1 max-h-24 overflow-y-auto mb-3">
                {myFills.map(fill => {
                  const isBuy = fill.buyerId === myTraderId
                  return (
                    <div key={fill.id} className="flex items-center justify-between text-sm">
                      <span className={`font-semibold ${isBuy ? 'text-neon-lime' : 'text-neon-magenta'}`}>
                        {isBuy ? 'BUY' : 'SELL'} {fill.quantity}
                      </span>
                      <span className="text-neon-cyan">${fill.price.toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-dark-secondary pt-2 space-y-1 text-xs">
                {boughtQty > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neon-lime font-semibold">Bought</span>
                    <span className="text-text-primary">{boughtQty} shrs · ${boughtValue.toFixed(2)}</span>
                  </div>
                )}
                {soldQty > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neon-magenta font-semibold">Sold</span>
                    <span className="text-text-primary">{soldQty} shrs · ${soldValue.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

