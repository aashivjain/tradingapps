import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const WS_URL = import.meta.env.VITE_EXCHANGE_WS_URL || 'ws://localhost:8787'

const EMPTY_BOOK = { bids: [], asks: [] }

export function usePeerExchangeSocket() {
  const socketRef = useRef(null)
  const reconnectRef = useRef(null)

  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')
  const [traderId, setTraderId] = useState('')
  const [snapshot, setSnapshot] = useState({
    symbols: [],
    books: {},
    trades: [],
    lastPrices: {},
    botsEnabled: false,
    connectedTraders: 0,
    you: {
      cash: 0,
      reservedCash: 0,
      stocks: {},
      reservedStocks: {},
    },
    yourOpenOrders: [],
  })

  const send = useCallback((type, payload = {}) => {
    const ws = socketRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return false
    }

    ws.send(JSON.stringify({ type, payload }))
    return true
  }, [])

  useEffect(() => {
    let alive = true

    const connect = () => {
      const ws = new WebSocket(WS_URL)
      socketRef.current = ws
      setError('')

      ws.onopen = () => {
        if (!alive) {
          return
        }
        setConnected(true)
        ws.send(JSON.stringify({ type: 'requestState' }))
      }

      ws.onmessage = event => {
        if (!alive) {
          return
        }

        try {
          const message = JSON.parse(event.data)
          if (message.type === 'welcome') {
            setTraderId(message.payload?.traderId || '')
            return
          }

          if (message.type === 'snapshot') {
            setSnapshot(message.payload)
            return
          }

          if (message.type === 'error') {
            setError(message.payload?.message || 'Unknown server error')
          }
        } catch {
          setError('Failed to parse server message')
        }
      }

      ws.onerror = () => {
        if (!alive) {
          return
        }
        setError('WebSocket error while connecting to peer exchange server')
      }

      ws.onclose = () => {
        if (!alive) {
          return
        }
        setConnected(false)
        reconnectRef.current = setTimeout(connect, 1500)
      }
    }

    connect()

    return () => {
      alive = false
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current)
      }
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  const api = useMemo(() => ({
    connected,
    error,
    traderId,
    symbols: snapshot.symbols,
    books: snapshot.books,
    trades: snapshot.trades,
    lastPrices: snapshot.lastPrices,
    botsEnabled: snapshot.botsEnabled,
    connectedTraders: snapshot.connectedTraders,
    you: snapshot.you,
    yourOpenOrders: snapshot.yourOpenOrders,
    getBook: symbol => snapshot.books[symbol] || EMPTY_BOOK,
    placeOrder: payload => send('placeOrder', payload),
    cancelOrder: orderId => send('cancelOrder', { orderId }),
    setBotsEnabled: enabled => send('setBots', { enabled }),
    setName: name => send('setName', { name }),
  }), [connected, error, traderId, snapshot, send])

  return api
}
