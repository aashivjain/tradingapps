const API_BASE = 'https://financialmodelingprep.com/api/v3/quote'
const API_KEY = import.meta.env.VITE_FMP_API_KEY || 'demo'

export async function fetchQuotes(symbols) {
  if (!Array.isArray(symbols) || symbols.length === 0) {
    return {}
  }

  const url = `${API_BASE}/${symbols.join(',')}?apikey=${API_KEY}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Quote API failed with status ${response.status}`)
  }

  const payload = await response.json()
  if (!Array.isArray(payload)) {
    throw new Error('Quote API returned an unexpected payload')
  }

  const quoteMap = {}
  payload.forEach(item => {
    const price = Number(item.price)
    const changePercent = Number(item.changesPercentage)

    if (item?.symbol && Number.isFinite(price)) {
      quoteMap[item.symbol] = {
        price,
        changePercent: Number.isFinite(changePercent) ? changePercent : 0,
      }
    }
  })

  return quoteMap
}
