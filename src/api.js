import axios from 'axios'

const REGIME_API = 'https://qrb3m3j5gj.execute-api.us-east-1.amazonaws.com'
const ALPACA_API = 'https://i5gldgg6ic.execute-api.us-east-1.amazonaws.com'

// Session ID — persists across page loads
const SESSION_ID = (() => {
  let id = localStorage.getItem('trading_session_id')
  if (!id) {
    id = `session-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    localStorage.setItem('trading_session_id', id)
  }
  return id
})()

export { SESSION_ID }

// Market Data
export const getRegime    = (symbol) =>
  axios.get(`${REGIME_API}/regime/${symbol}`).then(r => r.data)

export const getAccount   = () =>
  axios.get(`${REGIME_API}/account`).then(r => r.data)

export const getPositions = () =>
  axios.get(`${REGIME_API}/positions`).then(r => r.data)

// Search
export const searchSymbols = (q) =>
  axios.get(`${REGIME_API}/search?q=${encodeURIComponent(q)}`).then(r => r.data)

export const aiSearch = (query) =>
  axios.post(`${REGIME_API}/ai-search`, { query }).then(r => r.data)

// Watchlist
export const getWatchlist = () =>
  axios.get(`${REGIME_API}/watchlist?session_id=${SESSION_ID}`).then(r => r.data)

export const addToWatchlist = (symbol, name) =>
  axios.post(`${REGIME_API}/watchlist?session_id=${SESSION_ID}`, { symbol, name }).then(r => r.data)

export const removeFromWatchlist = (symbol) =>
  axios.delete(`${REGIME_API}/watchlist?session_id=${SESSION_ID}`, { data: { symbol } }).then(r => r.data)

// Scanner
export const scanSymbols = (symbols) =>
  axios.post(`${REGIME_API}/scan`, { symbols }).then(r => r.data)

export const submitAlpacaTrade = (symbol, side, qty, orderType = 'market') =>
  axios.post(`${ALPACA_API}/trade`, {
    message: `Get the price and news for ${symbol}, then book a ${side} trade for ${qty} shares at ${orderType} price`,
    session_id: `poc3-${SESSION_ID}`
  }).then(r => r.data)

  export const getRegimeHistory = (symbol) =>
  axios.get(`${REGIME_API}/regime-history/${symbol}`).then(r => r.data)