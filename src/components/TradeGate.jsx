const GATE_CONFIG = {
  TRENDING: {
    bg:      'bg-green-950',
    border:  'border-green-600',
    icon:    '🟢',
    title:   'text-green-400',
    status:  'OPEN — Trade with Full Size',
    desc:    'Market conditions are favorable. Trend is established and participation is strong.',
    tips: [
      'Use full position size',
      'Trail stops to lock in profits',
      'Momentum strategies work well',
      'Add to winners on pullbacks'
    ]
  },
  RANGING: {
    bg:      'bg-yellow-950',
    border:  'border-yellow-600',
    icon:    '🟡',
    title:   'text-yellow-400',
    status:  'CAUTION — Trade with Half Size',
    desc:    'Market is oscillating without clear direction. Reduce position size and set tighter targets.',
    tips: [
      'Use 50% of normal position size',
      'Target range extremes only',
      'Mean reversion strategies preferred',
      'Avoid breakout trades'
    ]
  },
  VOLATILE: {
    bg:      'bg-red-950',
    border:  'border-red-600',
    icon:    '🔴',
    title:   'text-red-400',
    status:  'BLOCKED — Step Aside',
    desc:    'Market conditions are unstable. High volatility increases risk of large adverse moves.',
    tips: [
      'No new positions recommended',
      'Consider reducing existing exposure',
      'Wait for volatility to normalize',
      'Monitor VIX and ATR for improvement'
    ]
  },
  LOW_ACTIVITY: {
    bg:      'bg-blue-950',
    border:  'border-blue-600',
    icon:    '🔵',
    title:   'text-blue-400',
    status:  'WAIT — Insufficient Activity',
    desc:    'Low volume and tight ranges suggest thin market conditions. Wait for participation to increase.',
    tips: [
      'No trades until volume improves',
      'Watch for breakout from consolidation',
      'Set alerts for volume spikes',
      'Review watchlist preparation'
    ]
  }
}

export default function TradeGate({ regime, symbol }) {
  if (!regime) return null

  const cfg = GATE_CONFIG[regime.regime] || GATE_CONFIG['RANGING']

  return (
    <div className={`${cfg.bg} border-2 ${cfg.border} rounded-xl p-5`}>
      <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
        🚦 Trade Gate — {symbol}
      </h2>

      {/* Status */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{cfg.icon}</span>
        <div>
          <div className={`text-sm font-black ${cfg.title}`}>{cfg.status}</div>
          <div className="text-xs text-gray-400 mt-1">{cfg.desc}</div>
        </div>
      </div>

      {/* Position Size Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Recommended Position Size</span>
          <span className={`font-bold ${cfg.title}`}>{regime.size}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${
              regime.size === 'FULL' ? 'bg-green-500 w-full'
              : regime.size === 'HALF' ? 'bg-yellow-500 w-1/2'
              : 'bg-gray-600 w-0'
            }`}
          />
        </div>
        <div className="flex justify-between text-xs mt-1 text-gray-600">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Trading Tips */}
      <div>
        <div className="text-xs font-bold text-gray-400 mb-2">💡 Regime Guidance</div>
        <div className="grid grid-cols-2 gap-2">
          {cfg.tips.map((tip, i) => (
            <div key={i}
              className="bg-black bg-opacity-20 rounded-lg px-3 py-2 text-xs text-gray-300 flex items-start gap-2">
              <span className="text-gray-500 mt-0.5">→</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}