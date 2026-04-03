import { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import RegimePanel from './components/RegimePanel'
import IndicatorsPanel from './components/IndicatorsPanel'
import PositionsPanel from './components/PositionsPanel'
import AccountPanel from './components/AccountPanel'
import TradeGate from './components/TradeGate'
import { getAccount, getPositions, getRegime } from './api'

const SYMBOLS = ['AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL']

export default function App() {
  const [account,   setAccount]   = useState(null)
  const [positions, setPositions] = useState([])
  const [regime,    setRegime]    = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [symbol,    setSymbol]    = useState('AAPL')
  const [regimeLoading, setRegimeLoading] = useState(false)

  const fetchAccountData = async () => {
    try {
      const [acc, pos] = await Promise.all([getAccount(), getPositions()])
      setAccount(acc)
      setPositions(pos.positions || [])
    } catch (err) {
      console.error('Account fetch error:', err)
    }
  }

  const fetchRegime = async (sym) => {
    setRegimeLoading(true)
    setRegime(null)
    try {
      const data = await getRegime(sym)
      setRegime(data)
    } catch (err) {
      toast.error(`Failed to fetch regime for ${sym}`)
    } finally {
      setRegimeLoading(false)
    }
  }

  useEffect(() => {
    fetchAccountData()
    fetchRegime(symbol)
    const interval = setInterval(fetchAccountData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSymbolChange = (sym) => {
    setSymbol(sym)
    fetchRegime(sym)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-lg">🌍</div>
            <div>
              <h1 className="text-lg font-bold text-white">Market Regime Detection</h1>
              <p className="text-xs text-gray-400">Context-Aware Trading · POC 3 · AWS Bedrock + Yahoo Finance</p>
            </div>
          </div>
          {account && (
            <div className="flex items-center gap-4 text-xs">
              <div className="text-center">
                <div className="text-gray-500">Portfolio</div>
                <div className="font-bold text-white">${Number(account.portfolio_value).toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">P&L</div>
                <div className={`font-bold ${positions.reduce((s,p) => s + Number(p.unrealized_pl||0), 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {positions.reduce((s,p) => s + Number(p.unrealized_pl||0), 0) >= 0 ? '+' : ''}
                  ${positions.reduce((s,p) => s + Number(p.unrealized_pl||0), 0).toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-400">Live</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Symbol Selector */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Analyze Symbol:</span>
          <div className="flex gap-2">
            {SYMBOLS.map(s => (
              <button key={s} onClick={() => handleSymbolChange(s)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  symbol === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}>
                {s}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <button onClick={() => fetchRegime(symbol)}
              disabled={regimeLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-bold rounded-lg transition-all">
              {regimeLoading ? '⏳ Analyzing...' : '🔄 Refresh Analysis'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">

        {/* Left Column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <RegimePanel regime={regime} loading={regimeLoading} symbol={symbol} />
          <TradeGate regime={regime} symbol={symbol} />
          <AccountPanel account={account} positions={positions} />
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <IndicatorsPanel regime={regime} loading={regimeLoading} />
          <PositionsPanel positions={positions} onRefresh={fetchAccountData} />
        </div>

      </div>
    </div>
  )
}