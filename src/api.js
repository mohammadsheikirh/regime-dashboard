import axios from 'axios'

const API_BASE = 'https://qrb3m3j5gj.execute-api.us-east-1.amazonaws.com'

export const getRegime    = (symbol) =>
  axios.get(`${API_BASE}/regime/${symbol}`).then(r => r.data)

export const getAccount   = () =>
  axios.get(`${API_BASE}/account`).then(r => r.data)

export const getPositions = () =>
  axios.get(`${API_BASE}/positions`).then(r => r.data)