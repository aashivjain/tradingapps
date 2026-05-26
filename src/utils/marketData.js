const LOCAL_SERVER = import.meta.env.VITE_EXCHANGE_WS_URL
  ? import.meta.env.VITE_EXCHANGE_WS_URL.replace('ws://', 'http://').replace('wss://', 'https://')
  : 'http://localhost:8787'

export async function fetchQuotes(symbols) {
  if (!Array.isArray(symbols) || symbols.length === 0) {
    return {}
  }

  const url = `${LOCAL_SERVER}/quotes?symbols=${symbols.join(',')}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Quote request failed with status ${response.status}`)
  }

  const payload = await response.json()

  if (payload.error) {
    throw new Error(payload.error)
  }

  const quoteMap = {}
  Object.entries(payload).forEach(([symbol, data]) => {
    const price = Number(data.price)
    if (Number.isFinite(price) && price > 0) {
      quoteMap[symbol] = {
        price,
        changePercent: Number.isFinite(data.changePercent) ? data.changePercent : 0,
      }
    }
  })

  return quoteMap
}
