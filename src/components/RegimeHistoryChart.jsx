import { useEffect, useState } from 'react'
import { getRegimeHistory } from '../api'

const REGIME_COLORS = {
  TRENDING:     { fill: '#22c55e', bg: 'bg-green-900/40',  text: 'text-green-400',  border: 'border-green-700/40' },
  RANGING:      { fill: '#eab308', bg: 'bg-yellow-900/40', text: 'text-yellow-400', border: 'border-yellow-700/40' },
  VOLATILE:     { fill: '#ef4444', bg: 'bg-red-900/40',    text: 'text-red-400',    border: 'border-red-700/40' },
  LOW_ACTIVITY: { fill: '#3b82f6', bg: 'bg-blue-900/40',   text: 'text-blue-400',   border: 'border-blue-700/40' },
}

const REGIME_NUM = { TRENDING: 3, RANGING: 2, LOW_ACTIVITY: 1, VOLATILE: 0 }

function getConfidenceClass(confidence) {
  if (confidence >= 75) return 'text-emerald-400'
  if (confidence >= 55) return 'text-yellow-400'
  return 'text-red-400'
}

function getAdxClass(adx) {
  if (adx >= 25) return 'text-emerald-400'
  if (adx >= 18) return 'text-yellow-400'
  return 'text-slate-400'
}

function getAtrClass(atr) {
  if (atr >= 4) return 'text-red-400'
  if (atr >= 2) return 'text-yellow-400'
  return 'text-emerald-400'
}

export default function RegimeHistoryChart({ symbol }) {
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!symbol) return
    setLoading(true)
    getRegimeHistory(symbol)
      .then(data => setHistory(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [symbol])

  if (!symbol) return null

  if (loading) return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="text-xs text-slate-500 text-center py-4">Loading regime history...</div>
    </div>
  )

  if (!history || history.count === 0) return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
        📅 Regime History — {symbol}
      </h2>
      <div className="text-xs text-slate-500 text-center py-4">
        No history yet. Analyze the symbol to start building history.
      </div>
    </div>
  )

  const data = history.history
  const summary = history.summary
  const total = Object.values(summary).reduce((a, b) => a + b, 0) || 1

  const chartW = 500
  const chartH = 80
  const padL = 10
  const padR = 10
  const padT = 10
  const padB = 20
  const innerW = chartW - padL - padR
  const innerH = chartH - padT - padB

  const points = data.map((d, i) => {
    const x = padL + (i / Math.max(data.length - 1, 1)) * innerW
    const y = padT + innerH - ((REGIME_NUM[d.regime] / 3) * innerH)
    return { x, y, d }
  })

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          📅 Regime History — {symbol}
        </h2>
        <span className="text-xs text-slate-400">{history.count} analyses</span>
      </div>

      {/* Summary Badges */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(summary).map(([regime, count]) => count > 0 && (
          <div
            key={regime}
            className={`${REGIME_COLORS[regime].bg} ${REGIME_COLORS[regime].border} border rounded-xl px-3 py-1.5 flex items-center gap-1.5`}
          >
            <span className={`text-xs font-bold ${REGIME_COLORS[regime].text}`}>{regime}</span>
            <span className="text-xs text-slate-400">×{count}</span>
            <span className="text-xs text-slate-500">({Math.round(count / total * 100)}%)</span>
          </div>
        ))}

        <div className="ml-auto text-xs text-slate-400 flex items-center">
          Most common:
          <span className={`ml-1.5 font-bold ${REGIME_COLORS[history.most_common]?.text}`}>
            {history.most_common}
          </span>
        </div>
      </div>

      {/* SVG Timeline Chart */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 mb-5">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Older</span>
          <span>Recent</span>
        </div>

        <div className="flex gap-2">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between text-right py-1" style={{ width: '80px', height: '80px' }}>
            <span className="text-green-400" style={{ fontSize: '9px' }}>TRENDING</span>
            <span className="text-yellow-400" style={{ fontSize: '9px' }}>RANGING</span>
            <span className="text-blue-400" style={{ fontSize: '9px' }}>LOW ACT.</span>
            <span className="text-red-400" style={{ fontSize: '9px' }}>VOLATILE</span>
          </div>

          {/* Chart */}
          <div className="flex-1">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ height: '80px' }}>
              {/* Grid lines */}
              {Object.entries(REGIME_NUM).map(([regime, val]) => {
                const y = padT + innerH - ((val / 3) * innerH)
                return (
                  <line
                    key={regime}
                    x1={padL}
                    y1={y}
                    x2={chartW - padR}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="0.6"
                    strokeDasharray="4,4"
                  />
                )
              })}

              {/* Line */}
              {points.length > 1 && (
                <polyline
                  points={polyline}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill={REGIME_COLORS[p.d.regime]?.fill || '#64748b'}
                  stroke="#0f172a"
                  strokeWidth="1"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
          Recent Analyses
        </div>

        {[...data].reverse().slice(0, 5).map((entry, i) => {
          const cfg = REGIME_COLORS[entry.regime] || REGIME_COLORS.RANGING
          const dt = new Date(entry.timestamp)
          const confidence = entry.confidence ?? 0
          const adx = entry.adx ?? 0
          const atr = entry.atr_pct ?? 0

          return (
            <div
              key={i}
              className="flex items-center justify-between bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  {entry.regime}
                </span>

                <span className={`text-xs font-semibold ${getConfidenceClass(confidence)}`}>
                  {confidence}% Confidence
                </span>
              </div>

              <div className="flex items-center gap-5 text-xs">
                <span className={`${getAdxClass(adx)} font-medium`}>
                  ADX: {adx.toFixed(1)}
                </span>

                <span className={`${getAtrClass(atr)} font-medium`}>
                  ATR: {atr.toFixed(2)}%
                </span>

                <span className="text-slate-300 font-medium tabular-nums">
                  {dt.toLocaleDateString()} {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}