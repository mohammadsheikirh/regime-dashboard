import { useState, useEffect, useRef } from 'react'
import { pollStatus } from '../api'

const AGENTS = [
  { key: 'price',     icon: '💹', label: 'Price Agent',         desc: 'Fetching Alpaca market data' },
  { key: 'news',      icon: '📰', label: 'News Agent',          desc: 'Analyzing sentiment' },
  { key: 'risk',      icon: '⚖️', label: 'Risk Agent',          desc: 'Checking buying power & limits' },
  { key: 'booking',   icon: '🔖', label: 'Order Submission',    desc: 'Submitting to Alpaca' },
  { key: 'lifecycle', icon: '🏦', label: 'Order Status',        desc: 'Confirming order status' },
]

function parsePrice(text) {
  if (!text) return null
  const find = (...pp) => { for (const p of pp) { const m = text.match(p); if (m?.[1]) return m[1].trim() } return null }
  return {
    price: find(/Last Price\*\*\s*\|\s*\$?([\d.]+)/, /last_price.*?([\d.]+)/),
    bid:   find(/Bid\*\*\s*\|\s*\$?([\d.]+)/),
    ask:   find(/Ask\*\*\s*\|\s*\$?([\d.]+)/),
  }
}

function parseNews(text) {
  if (!text) return null
  const find = (...pp) => { for (const p of pp) { const m = text.match(p); if (m?.[1]) return m[1].trim() } return null }
  return {
    sentiment:  find(/(BULLISH|BEARISH|NEUTRAL)/),
    sentScore:  find(/Score:\s*([\d.]+)\//, /(\d\.\d+)\)/),
    keyDrivers: find(/\*\*Summary:\*\*\s*([^\n]+)/, /Summary[*:\s]+([^\n]+)/),
  }
}

function parseRisk(text) {
  if (!text) return null
  const find = (...pp) => { for (const p of pp) { const m = text.match(p); if (m?.[1]) return m[1].trim() } return null }
  return {
    risk:        /APPROVED/i.test(text) ? 'APPROVED' : /BLOCKED/i.test(text) ? 'BLOCKED' : null,
    notional:    find(/Notional\*\*\s*\|\s*\$?([\d,]+\.?\d*)/),
    buyingPower: find(/Buying Power\*\*\s*\|\s*\$?([\d,]+\.?\d*)/),
  }
}

function parseBooking(text) {
  if (!text) return null
  const find = (...pp) => { for (const p of pp) { const m = text.match(p); if (m?.[1]) return m[1].trim() } return null }
  return {
    orderId: find(/Order ID\*\*\s*\|\s*`?([a-f0-9-]{36})`?/),
    status:  find(/Status\*\*\s*\|\s*([A-Z]+)/),
    qty:     find(/Qty\*\*\s*\|\s*(\d+)/),
    type:    find(/Type\*\*\s*\|\s*([A-Z]+)/),
  }
}

function parseLifecycle(text) {
  if (!text) return null
  const find = (...pp) => { for (const p of pp) { const m = text.match(p); if (m?.[1]) return m[1].trim() } return null }
  return {
    status:    find(/Status\*\*\s*\|\s*([A-Z_]+)/),
    filledQty: find(/Filled Qty\*\*\s*\|\s*([\d\s/]+)/),
    fillPrice: find(/Fill Price\*\*\s*\|\s*([^\n|]+)/),
  }
}

export default function AgentPipeline({ requestId, onComplete }) {
  const [phase, setPhase]       = useState('PROCESSING')
  const [stepIdx, setStepIdx]   = useState(0)
  const [partials, setPartials] = useState({})
  const [errMsg, setErrMsg]     = useState(null)
  const [sentimentWarning, setSentimentWarning] = useState(null)
  const startRef                = useRef(Date.now())
  const pollRef                 = useRef(null)
  const timerRef                = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - startRef.current) / 1000)
      setStepIdx(Math.min(Math.floor(secs / 15), AGENTS.length - 1))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const data = await pollStatus(requestId)
        if (data.partial_results) {
          setPartials(data.partial_results)
          // Check for bearish sentiment warning
            if (data.partial_results?.news) {
                const newsData = parseNews(data.partial_results.news)
                if (newsData?.sentiment === 'BEARISH') {
                    setSentimentWarning(newsData.keyDrivers || 'Bearish sentiment detected')
                }
            }
          const keys = ['price', 'news', 'risk', 'booking', 'lifecycle']
          const done = keys.filter(k => data.partial_results[k]).length
          setStepIdx(Math.min(done, AGENTS.length - 1))
        }
        if (data.status === 'COMPLETED') {
          clearInterval(pollRef.current)
          clearInterval(timerRef.current)
          setPhase('COMPLETED')
          setStepIdx(AGENTS.length)
          if (data.partial_results) setPartials(data.partial_results)
          onComplete(data.result)
        } else if (data.status === 'FAILED') {
          clearInterval(pollRef.current)
          clearInterval(timerRef.current)
          setPhase('FAILED')
          setErrMsg(data.error)
        }
      } catch (e) { console.error(e) }
    }, 3000)
    return () => clearInterval(pollRef.current)
  }, [requestId])

  const isDone   = idx => phase === 'COMPLETED' || idx < stepIdx
  const isActive = idx => idx === stepIdx && phase === 'PROCESSING'

  const priceI    = parsePrice(partials.price)
  const newsI     = parseNews(partials.news)
  const riskI     = parseRisk(partials.risk)
  const bookingI  = parseBooking(partials.booking)
  const lifecycleI= parseLifecycle(partials.lifecycle)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">🤖 Agent Pipeline</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">{requestId}</span>
          {phase === 'PROCESSING' && <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full animate-pulse">Processing...</span>}
          {phase === 'COMPLETED'  && <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full">✅ Completed</span>}
          {phase === 'FAILED'     && <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded-full">❌ Failed</span>}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {AGENTS.map((agent, idx) => {
          const done   = isDone(idx)
          const active = isActive(idx)
          return (
            <div key={agent.key}>
              <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-500 ${
                done ? 'bg-green-950 border-green-800' : active ? 'bg-yellow-950 border-yellow-700' : 'bg-gray-800 border-gray-700'
              }`}>
                <span className="text-lg">{agent.icon}</span>
                <div className="flex-1">
                  <div className={`text-xs font-bold ${done ? 'text-green-400' : active ? 'text-yellow-400' : 'text-gray-500'}`}>
                    {agent.label}
                  </div>
                  <div className="text-xs text-gray-500">{agent.desc}</div>
                </div>
                <div className="text-sm w-5 text-center">
                  {done   && '✅'}
                  {active && <span className="inline-block animate-spin">⚙️</span>}
                  {!done && !active && <span className="text-gray-600">⏸</span>}
                </div>
              </div>

              {/* Intel Cards */}
              {agent.key === 'price' && priceI?.price && (
                <div className="mt-2 bg-gray-800 rounded-lg p-3 border border-yellow-900">
                  <div className="text-xs text-yellow-400 font-bold mb-2">💹 Alpaca Market Data</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><div className="text-xs text-gray-500">Last</div><div className="text-sm font-bold text-white">${priceI.price}</div></div>
                    {priceI.bid && <div><div className="text-xs text-gray-500">Bid</div><div className="text-xs text-red-400">${priceI.bid}</div></div>}
                    {priceI.ask && <div><div className="text-xs text-gray-500">Ask</div><div className="text-xs text-green-400">${priceI.ask}</div></div>}
                  </div>
                </div>
              )}

                {agent.key === 'news' && newsI?.sentiment && (
                <div className={`mt-2 rounded-lg p-3 border ${
                    newsI.sentiment === 'BULLISH' ? 'bg-green-950 border-green-800 text-green-400'
                    : newsI.sentiment === 'BEARISH' ? 'bg-red-950 border-red-800 text-red-400'
                    : 'bg-yellow-950 border-yellow-800 text-yellow-400'}`}>
                    <div className="text-xs font-bold mb-2">📰 Sentiment</div>
                    <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold">
                        {newsI.sentiment === 'BULLISH' ? '🟢' : newsI.sentiment === 'BEARISH' ? '🔴' : '🟡'} {newsI.sentiment}
                    </span>
                    {newsI.sentScore && <span className="text-xs opacity-80">Score: {newsI.sentScore}/1.0</span>}
                    </div>
                    {newsI.sentScore && (
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                        <div className={`h-1.5 rounded-full ${newsI.sentiment === 'BULLISH' ? 'bg-green-500' : newsI.sentiment === 'BEARISH' ? 'bg-red-500' : 'bg-yellow-500'}`}
                        style={{width:`${Math.min(parseFloat(newsI.sentScore)*100,100)}%`}} />
                    </div>
                    )}
                    {newsI.keyDrivers && <div className="text-xs opacity-80 mt-1">{newsI.keyDrivers}</div>}

                    {/* Advisory Banner for BEARISH */}
                    {newsI.sentiment === 'BEARISH' && phase === 'PROCESSING' && (
                    <div className="mt-3 bg-red-900 border border-red-600 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                        <span className="text-lg">⚠️</span>
                        <div className="flex-1">
                            <div className="text-xs font-bold text-red-200 mb-1">
                            Sentiment Advisory — BEARISH Signal Detected
                            </div>
                            <div className="text-xs text-red-300 mb-2">
                            News sentiment is bearish. The trade will proceed unless you cancel it now.
                            Risk agent is still validating limits independently.
                            </div>
                            <div className="text-xs text-red-400 italic">
                            ℹ️ Trade continues automatically — this is advisory only.
                            </div>
                        </div>
                        </div>
                    </div>
                    )}
                </div>
                )}

              {agent.key === 'risk' && riskI?.risk && (
                <div className={`mt-2 rounded-lg p-3 border ${riskI.risk === 'APPROVED' ? 'bg-green-950 border-green-800' : 'bg-red-950 border-red-800'}`}>
                  <div className="text-xs font-bold mb-1">⚖️ Risk Check</div>
                  <div className={`text-sm font-bold ${riskI.risk === 'APPROVED' ? 'text-green-400' : 'text-red-400'}`}>
                    {riskI.risk === 'APPROVED' ? '✅ APPROVED' : '❌ BLOCKED'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {riskI.notional    && <div className="text-xs text-gray-400">Notional: <span className="text-white">${riskI.notional}</span></div>}
                    {riskI.buyingPower && <div className="text-xs text-gray-400">Buying Power: <span className="text-green-400">${riskI.buyingPower}</span></div>}
                  </div>
                </div>
              )}

              {agent.key === 'booking' && bookingI?.orderId && (
                <div className="mt-2 bg-gray-800 rounded-lg p-3 border border-yellow-900">
                  <div className="text-xs text-yellow-400 font-bold mb-2">🔖 Alpaca Order</div>
                  <div className="text-xs font-mono text-yellow-300 font-bold mb-2">{bookingI.orderId}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {bookingI.qty    && <div className="text-xs text-gray-400">Qty: <span className="text-white">{bookingI.qty}</span></div>}
                    {bookingI.type   && <div className="text-xs text-gray-400">Type: <span className="text-white">{bookingI.type}</span></div>}
                    {bookingI.status && <div className="text-xs text-gray-400">Status: <span className="text-blue-400">{bookingI.status}</span></div>}
                  </div>
                </div>
              )}

              {agent.key === 'lifecycle' && lifecycleI?.status && (
                <div className="mt-2 bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="text-xs text-gray-400 font-bold mb-2">🏦 Order Lifecycle</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-xs text-gray-400">Status: <span className={`font-bold ${lifecycleI.status === 'FILLED' ? 'text-green-400' : lifecycleI.status === 'ACCEPTED' ? 'text-blue-400' : 'text-yellow-400'}`}>{lifecycleI.status}</span></div>
                    {lifecycleI.filledQty  && <div className="text-xs text-gray-400">Filled: <span className="text-white">{lifecycleI.filledQty}</span></div>}
                    {lifecycleI.fillPrice  && <div className="text-xs text-gray-400">Price: <span className="text-white">{lifecycleI.fillPrice}</span></div>}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {/* Persistent Sentiment Warning Banner */}
        {sentimentWarning && phase !== 'FAILED' && (
        <div className="mt-4 bg-red-950 border border-red-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
                <div className="text-sm font-bold text-red-300 mb-1">
                Sentiment Advisory
                </div>
                <div className="text-xs text-red-400 mb-3 leading-relaxed">
                {sentimentWarning}
                </div>
                {phase === 'COMPLETED' && (
                <div className="text-xs text-red-500 italic">
                    ℹ️ Order was submitted to Alpaca. You can cancel it from the Order History panel if needed.
                </div>
                )}
            </div>
            <button
                onClick={() => setSentimentWarning(null)}
                className="text-red-500 hover:text-red-300 text-xs px-2 py-1 rounded border border-red-700 hover:border-red-500 transition-all">
                Dismiss
            </button>
            </div>
        </div>
        )}
      {phase === 'FAILED' && errMsg && (
        <div className="bg-red-950 border border-red-800 rounded-lg p-3 mt-3">
          <div className="text-xs font-bold text-red-400 mb-1">❌ Error</div>
          <div className="text-xs text-red-300">{errMsg}</div>
        </div>
      )}
    </div>
  )
}