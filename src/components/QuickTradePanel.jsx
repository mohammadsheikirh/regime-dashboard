import { useState } from 'react'
import { submitAlpacaTrade } from '../api'
import { toast } from 'react-hot-toast'

export default function QuickTradePanel({ symbol, regime }) {
  const [side,      setSide]      = useState('BUY')
  const [qty,       setQty]       = useState('10')
  const [orderType, setOrderType] = useState('market')
  const [loading,   setLoading]   = useState(false)
  const [requestId, setRequestId] = useState(null)

  if (!symbol) return null

  const isBlocked = regime?.action === 'AVOID' || regime?.action === 'WAIT'
  const isCaution = regime?.action === 'CAUTION'

  const handleTrade = async () => {
    if (!qty || Number(qty) <= 0) {
      toast.error('Enter a valid quantity')
      return
    }
    if (isBlocked && side === 'BUY') {
      toast.error(`BUY blocked — market is ${regime?.regime}`)
      return
    }
    setLoading(true)
    try {
      const data = await submitAlpacaTrade(symbol, side, qty, orderType)
      setRequestId(data.request_id)
      toast.success(`${side} order submitted: ${data.request_id}`)
    } catch (e) {
      toast.error(`Trade failed: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
        🚀 Quick Trade — {symbol}
      </h2>

      {/* Regime Warning */}
      {isBlocked && side === 'BUY' && (
        <div className="bg-red-950 border border-red-700 rounded-lg px-3 py-2 mb-3 text-xs text-red-300 font-bold text-center">
          🚫 BUY blocked — {regime?.regime} regime. SELL to reduce exposure only.
        </div>
      )}
      {isCaution && (
        <div className="bg-yellow-950 border border-yellow-700 rounded-lg px-3 py-2 mb-3 text-xs text-yellow-300 text-center">
          ⚠️ RANGING market — consider half position size
        </div>
      )}

      {/* BUY / SELL */}
      <div className="flex gap-2 mb-3">
        <button onClick={() => setSide('BUY')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            side === 'BUY' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}>
          BUY
        </button>
        <button onClick={() => setSide('SELL')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
            side === 'SELL' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}>
          SELL
        </button>
      </div>

      {/* Quantity */}
      <div className="mb-3">
        <label className="text-xs text-gray-400 mb-1 block">Quantity (Shares)</label>
        <input type="number" value={qty} onChange={e => setQty(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          placeholder="e.g. 10" />
      </div>

      {/* Order Type */}
      <div className="mb-4">
        <label className="text-xs text-gray-400 mb-1 block">Order Type</label>
        <div className="flex gap-2">
          <button onClick={() => setOrderType('market')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              orderType === 'market' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}>
            Market
          </button>
          <button onClick={() => setOrderType('limit')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              orderType === 'limit' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}>
            Limit
          </button>
        </div>
      </div>

      {/* Submit */}
      <button onClick={handleTrade}
        disabled={loading || (isBlocked && side === 'BUY')}
        className={`w-full py-3 rounded-lg text-sm font-bold transition-all ${
          loading || (isBlocked && side === 'BUY')
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : side === 'BUY'
            ? 'bg-green-600 hover:bg-green-500 text-white'
            : 'bg-red-600 hover:bg-red-500 text-white'
        }`}>
        {loading ? '⏳ Submitting...' : `🚀 ${side} ${qty} ${symbol}`}
      </button>

      {/* Confirmation */}
      {requestId && (
        <div className="mt-3 bg-green-950 border border-green-700 rounded-lg p-3 text-xs text-green-300">
          ✅ Order submitted to Alpaca<br/>
          <span className="font-mono text-green-400">{requestId}</span>
        </div>
      )}

      {/* Regime Context */}
      {regime && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Regime: <span className={`font-bold ${
            regime.regime === 'TRENDING'     ? 'text-green-400'
            : regime.regime === 'RANGING'    ? 'text-yellow-400'
            : regime.regime === 'VOLATILE'   ? 'text-red-400'
            : 'text-blue-400'
          }`}>{regime.emoji} {regime.regime}</span>
          · Size: <span className="text-gray-300">{regime.size}</span>
        </div>
      )}
    </div>
  )
}