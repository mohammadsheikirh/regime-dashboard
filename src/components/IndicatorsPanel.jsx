function Indicator({ label, value, unit, status, description }) {
  const statusColors = {
    good:    'text-green-400',
    warning: 'text-yellow-400',
    bad:     'text-red-400',
    neutral: 'text-blue-400',
    normal:  'text-gray-300',
  }
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-bold ${statusColors[status] || 'text-white'}`}>
        {value}{unit}
      </div>
      {description && (
        <div className="text-xs text-gray-500 mt-1">{description}</div>
      )}
    </div>
  )
}

function ScoreBar({ label, score, maxScore, color }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className={`font-bold ${color}`}>{score}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all duration-500 ${
          color === 'text-green-400'  ? 'bg-green-500'
          : color === 'text-yellow-400' ? 'bg-yellow-500'
          : color === 'text-red-400'    ? 'bg-red-500'
          : 'bg-blue-500'
        }`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  )
}

export default function IndicatorsPanel({ regime, loading }) {
  if (loading) return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="text-xs text-gray-500 text-center py-8">
        ⏳ Loading technical indicators...
      </div>
    </div>
  )

  if (!regime?.indicators) return null

  const ind    = regime.indicators
  const scores = regime.scores || {}
  const maxScore = Math.max(...Object.values(scores), 1)

  // Determine indicator statuses
  const adxStatus  = ind.adx > 30 ? 'good' : ind.adx > 20 ? 'warning' : 'bad'
  const atrStatus  = ind.atr_pct > 3.5 ? 'bad' : ind.atr_pct > 2 ? 'warning' : 'good'
  const bbStatus   = ind.bb_width > 8 ? 'bad' : ind.bb_width < 4 ? 'neutral' : 'normal'
  const volStatus  = ind.vol_ratio > 1.3 ? 'good' : ind.vol_ratio < 0.7 ? 'bad' : 'normal'
  const smaStatus  = ind.above_sma20 && ind.above_sma50 ? 'good' : !ind.above_sma20 && !ind.above_sma50 ? 'bad' : 'warning'
  const chg5Status = ind.price_change_5d > 2 ? 'good' : ind.price_change_5d < -2 ? 'bad' : 'normal'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
        📊 Technical Indicators
      </h2>

      {/* Price Header */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">Current Price</div>
          <div className="text-2xl font-black text-white">${ind.current_price?.toFixed(2)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">5D Change</div>
          <div className={`text-lg font-bold ${ind.price_change_5d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {ind.price_change_5d >= 0 ? '+' : ''}{ind.price_change_5d?.toFixed(2)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">20D Change</div>
          <div className={`text-lg font-bold ${ind.price_change_20d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {ind.price_change_20d >= 0 ? '+' : ''}{ind.price_change_20d?.toFixed(2)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Data Source</div>
          <div className="text-xs text-blue-400 font-bold">{ind.data_source}</div>
          <div className="text-xs text-gray-600">{ind.bars_analyzed} bars</div>
        </div>
      </div>

      {/* Indicator Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Indicator label="ADX" value={ind.adx?.toFixed(1)} unit=""
          status={adxStatus}
          description={ind.adx > 30 ? 'Strong trend' : ind.adx > 20 ? 'Moderate trend' : 'Weak/No trend'} />
        <Indicator label="ATR %" value={ind.atr_pct?.toFixed(2)} unit="%"
          status={atrStatus}
          description={ind.atr_pct > 3.5 ? 'High volatility' : ind.atr_pct > 2 ? 'Moderate' : 'Low volatility'} />
        <Indicator label="BB Width" value={ind.bb_width?.toFixed(1)} unit="%"
          status={bbStatus}
          description={ind.bb_width > 8 ? 'Expanding bands' : ind.bb_width < 4 ? 'Squeeze' : 'Normal'} />
        <Indicator label="SMA 20" value={ind.sma20?.toFixed(2)} unit=""
          status={ind.above_sma20 ? 'good' : 'bad'}
          description={ind.above_sma20 ? '▲ Price above' : '▼ Price below'} />
        <Indicator label="SMA 50" value={ind.sma50?.toFixed(2)} unit=""
          status={ind.above_sma50 ? 'good' : 'bad'}
          description={ind.above_sma50 ? '▲ Price above' : '▼ Price below'} />
        <Indicator label="Vol Ratio" value={ind.vol_ratio?.toFixed(2)} unit="x"
          status={volStatus}
          description={ind.vol_ratio > 1.3 ? 'Above avg volume' : ind.vol_ratio < 0.7 ? 'Thin market' : 'Normal volume'} />
      </div>

      {/* Bollinger Bands */}
      {ind.bb_upper && ind.bb_lower && (
        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          <div className="text-xs font-bold text-gray-400 mb-2">📉 Bollinger Bands</div>
          <div className="relative h-8 bg-gray-700 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center px-2">
              <div className="text-xs text-gray-500">Lower: ${ind.bb_lower?.toFixed(2)}</div>
              <div className="flex-1 mx-2 relative h-2 bg-gray-600 rounded">
                {ind.current_price && ind.bb_lower && ind.bb_upper && (
                  <div className="absolute h-2 w-2 bg-white rounded-full top-0 -mt-0 transform -translate-y-0"
                    style={{
                      left: `${Math.min(Math.max(((ind.current_price - ind.bb_lower) / (ind.bb_upper - ind.bb_lower)) * 100, 0), 100)}%`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                )}
              </div>
              <div className="text-xs text-gray-500">Upper: ${ind.bb_upper?.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Regime Score Breakdown */}
      <div className="bg-gray-800 rounded-lg p-3">
        <div className="text-xs font-bold text-gray-400 mb-3">🎯 Regime Score Breakdown</div>
        <ScoreBar label="📈 TRENDING"     score={scores.TRENDING     || 0} maxScore={maxScore} color="text-green-400" />
        <ScoreBar label="↔️ RANGING"      score={scores.RANGING      || 0} maxScore={maxScore} color="text-yellow-400" />
        <ScoreBar label="🌪️ VOLATILE"     score={scores.VOLATILE     || 0} maxScore={maxScore} color="text-red-400" />
        <ScoreBar label="😴 LOW ACTIVITY" score={scores.LOW_ACTIVITY || 0} maxScore={maxScore} color="text-blue-400" />
      </div>
    </div>
  )
}