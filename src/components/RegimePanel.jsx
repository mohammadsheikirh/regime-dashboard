const REGIME_CONFIG = {
  TRENDING: {
    bg: 'bg-green-950', border: 'border-green-700',
    title: 'text-green-400', badge: 'bg-green-900 text-green-300',
    bar: 'bg-green-500', icon: '📈'
  },
  RANGING: {
    bg: 'bg-yellow-950', border: 'border-yellow-700',
    title: 'text-yellow-400', badge: 'bg-yellow-900 text-yellow-300',
    bar: 'bg-yellow-500', icon: '↔️'
  },
  VOLATILE: {
    bg: 'bg-red-950', border: 'border-red-700',
    title: 'text-red-400', badge: 'bg-red-900 text-red-300',
    bar: 'bg-red-500', icon: '🌪️'
  },
  LOW_ACTIVITY: {
    bg: 'bg-blue-950', border: 'border-blue-700',
    title: 'text-blue-400', badge: 'bg-blue-900 text-blue-300',
    bar: 'bg-blue-500', icon: '😴'
  },
}

export default function RegimePanel({ regime, loading, symbol }) {
  if (loading) return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
      </div>
      <div className="text-xs text-gray-500 text-center py-8">
        ⏳ Analyzing market regime for {symbol}...
      </div>
    </div>
  )

  if (!regime) return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="text-xs text-gray-500 text-center py-8">
        Select a symbol to analyze market regime
      </div>
    </div>
  )

  const cfg = REGIME_CONFIG[regime.regime] || REGIME_CONFIG['RANGING']

  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          🌍 Market Regime
        </h2>
        <span className="text-xs text-gray-500">
          {regime.timestamp ? new Date(regime.timestamp).toLocaleTimeString() : ''}
        </span>
      </div>

      {/* Main Regime Display */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">{cfg.icon}</div>
        <div className="flex-1">
          <div className={`text-2xl font-black ${cfg.title}`}>{regime.regime}</div>
          <div className="text-xs text-gray-400 mt-1">{symbol} · Yahoo Finance Data</div>
          <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block font-bold ${cfg.badge}`}>
            {regime.action} · {regime.size} SIZE
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-white">{regime.confidence}%</div>
          <div className="text-xs text-gray-500">Confidence</div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className={`h-2 rounded-full ${cfg.bar} transition-all duration-700`}
            style={{ width: `${regime.confidence}%` }} />
        </div>
      </div>

      {/* AI Reasoning */}
      {regime.reasoning && (
        <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-3">
          <div className="text-xs font-bold text-gray-400 mb-1">🧠 AI Analysis</div>
          <div className="text-xs text-gray-300 leading-relaxed">{regime.reasoning}</div>
        </div>
      )}

      {/* Key Risk */}
      {regime.key_risk && (
        <div className="bg-black bg-opacity-20 rounded-lg p-3 mb-3">
          <div className="text-xs font-bold text-gray-400 mb-1">⚠️ Key Risk</div>
          <div className="text-xs text-gray-300">{regime.key_risk}</div>
        </div>
      )}

      {/* Signals */}
      {regime.signals && regime.signals.length > 0 && (
        <div>
          <div className="text-xs font-bold text-gray-400 mb-2">📋 Signals</div>
          <div className="flex flex-col gap-1">
            {regime.signals.map((sig, i) => (
              <div key={i} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>{sig}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}