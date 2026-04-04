import { useState } from 'react'
import { scanSymbols } from '../api'
import { toast } from 'react-hot-toast'

const REGIME_COLORS = {
  TRENDING:     { bg: 'bg-green-950',  border: 'border-green-700',  text: 'text-green-400',  badge: 'bg-green-900 text-green-300'  },
  RANGING:      { bg: 'bg-yellow-950', border: 'border-yellow-700', text: 'text-yellow-400', badge: 'bg-yellow-900 text-yellow-300' },
  VOLATILE:     { bg: 'bg-red-950',    border: 'border-red-700',    text: 'text-red-400',    badge: 'bg-red-900 text-red-300'      },
  LOW_ACTIVITY: { bg: 'bg-blue-950',   border: 'border-blue-700',   text: 'text-blue-400',   badge: 'bg-blue-900 text-blue-300'    },
}

export default function RegimeScannerPanel({ watchlist, onSymbolSelect }) {
  const [scanning,  setScanning]  = useState(false)
  const [scanData,  setScanData]  = useState(null)
  const [progress,  setProgress]  = useState(0)

  const handleScan = async () => {
    if (watchlist.length === 0) {
      toast.error('Add symbols to watchlist first')
      return
    }
    setScanning(true)
    setScanData(null)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 8, 90))
    }, 1500)

    try {
      const symbols = watchlist.map(w => w.symbol)
      const data    = await scanSymbols(symbols)
      setScanData(data)
      setProgress(100)
      toast.success(`Scanned ${data.scanned} symbols`)
    } catch (e) {
      toast.error('Scan failed')
    } finally {
      clearInterval(progressInterval)
      setScanning(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          📡 Regime Scanner
        </h2>
        <button onClick={handleScan} disabled={scanning || watchlist.length === 0}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            scanning || watchlist.length === 0
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}>
          {scanning ? '⏳ Scanning...' : `🔍 Scan All (${watchlist.length})`}
        </button>
      </div>

      {/* Progress Bar */}
      {scanning && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Analyzing market regimes...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="h-2 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!scanning && !scanData && (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">📡</div>
          <div className="text-sm text-gray-500">
            {watchlist.length === 0
              ? 'Add symbols to watchlist to scan'
              : `Click "Scan All" to analyze ${watchlist.length} symbols`}
          </div>
        </div>
      )}

      {/* Scan Results */}
      {scanData && !scanning && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: 'TRENDING',     count: scanData.summary?.TRENDING     || 0, color: 'text-green-400',  bg: 'bg-green-950'  },
              { label: 'RANGING',      count: scanData.summary?.RANGING      || 0, color: 'text-yellow-400', bg: 'bg-yellow-950' },
              { label: 'VOLATILE',     count: scanData.summary?.VOLATILE     || 0, color: 'text-red-400',    bg: 'bg-red-950'    },
              { label: 'LOW ACT.',     count: scanData.summary?.LOW_ACTIVITY || 0, color: 'text-blue-400',   bg: 'bg-blue-950'   },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-lg p-2 text-center border border-gray-700`}>
                <div className={`text-lg font-black ${s.color}`}>{s.count}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Best Opportunity */}
          {scanData.best_opportunity && (
            <div className="bg-green-950 border border-green-700 rounded-lg p-3 mb-4">
              <div className="text-xs font-bold text-green-400 mb-1">🏆 Best Opportunity</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white">{scanData.best_opportunity}</span>
                <button onClick={() => onSymbolSelect(scanData.best_opportunity)}
                  className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-all">
                  Analyze →
                </button>
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="flex flex-col gap-2">
            {scanData.results?.map((item, idx) => {
              const cfg = REGIME_COLORS[item.regime] || REGIME_COLORS['RANGING']
              return (
                <div key={item.symbol}
                  className={`${cfg.bg} border ${cfg.border} rounded-lg p-3 cursor-pointer hover:opacity-90 transition-all`}
                  onClick={() => onSymbolSelect(item.symbol)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-400">#{idx+1}</span>
                      <span className="text-sm font-black text-white">{item.symbol}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${cfg.badge}`}>
                        {item.emoji} {item.regime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${cfg.text}`}>{item.confidence}%</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        item.action === 'TRADE'   ? 'bg-green-800 text-green-300'
                        : item.action === 'CAUTION' ? 'bg-yellow-800 text-yellow-300'
                        : 'bg-red-800 text-red-300'
                      }`}>{item.action}</span>
                    </div>
                  </div>

                  {/* Indicators mini row */}
                  {item.indicators && (
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>ADX: <span className="text-gray-300">{item.indicators.adx?.toFixed(1)}</span></span>
                      <span>ATR: <span className="text-gray-300">{item.indicators.atr_pct?.toFixed(2)}%</span></span>
                      <span>BB: <span className="text-gray-300">{item.indicators.bb_width?.toFixed(1)}%</span></span>
                      <span>5D: <span className={item.indicators.price_change_5d >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {item.indicators.price_change_5d >= 0 ? '+' : ''}{item.indicators.price_change_5d?.toFixed(2)}%
                      </span></span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}