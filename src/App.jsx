import { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import RegimePanel from './components/RegimePanel'
import IndicatorsPanel from './components/IndicatorsPanel'
import PositionsPanel from './components/PositionsPanel'
import AccountPanel from './components/AccountPanel'
import TradeGate from './components/TradeGate'
import SearchPanel from './components/SearchPanel'
import WatchlistPanel from './components/WatchlistPanel'
import RegimeScannerPanel from './components/RegimeScannerPanel'
//import { getAccount, getPositions, getRegime, getWatchlist } from './api'
import QuickTradePanel from './components/QuickTradePanel'
import RegimeHistoryChart from './components/RegimeHistoryChart'
import OrdersPanel from './components/OrdersPanel'
import { getAccount, getPositions, getRegime, getWatchlist, getOrders } from './api'

export default function App() {
  const [account,       setAccount]       = useState(null)
  const [positions,     setPositions]     = useState([])
  const [regime,        setRegime]        = useState(null)
  const [watchlist,     setWatchlist]     = useState([])
  const [symbol,        setSymbol]        = useState(null)
  const [regimeLoading, setRegimeLoading] = useState(false)
  const [activeTab,     setActiveTab]     = useState('regime') // 'regime' | 'scanner'
  const [orders, setOrders] = useState([])

  const fetchOrders = async () => {
    try {
      const data = await getOrders()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Orders fetch error:', err)
    }
  }

  const fetchAccountData = async () => {
    try {
      const [acc, pos, ord] = await Promise.all([
        getAccount(), getPositions(), getOrders()
      ])
      setAccount(acc)
      setPositions(pos.positions || [])
      setOrders(ord.orders || [])
    } catch (err) {
      console.error('Account fetch error:', err)
    }
  }
  
  const fetchWatchlist = async () => {
    try {
      const data = await getWatchlist()
      setWatchlist(data.symbols || [])
      // Auto-select first symbol if none selected
      if (!symbol && data.symbols?.length > 0) {
        handleSymbolSelect(data.symbols[0].symbol)
      }
    } catch (err) {
      console.error('Watchlist fetch error:', err)
    }
  }

  const fetchRegime = async (sym) => {
    if (!sym) return
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

  const handleSymbolSelect = (sym) => {
    setSymbol(sym)
    setActiveTab('regime')
    fetchRegime(sym)
  }

  useEffect(() => {
    fetchAccountData()
    fetchWatchlist()
    const interval = setInterval(fetchAccountData, 30000)
    return () => clearInterval(interval)
  }, [])

  const totalPL = positions.reduce((s, p) => s + Number(p.unrealized_pl || 0), 0)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-lg">🌍</div>
            <div>
              <h1 className="text-lg font-bold text-white">Market Regime Detection - Analyze - Trade Booking</h1>
              <p className="text-xs text-gray-400">Context-Aware Trading - AWS Bedrock + Yahoo Finance</p>
            </div>
          </div>
          {account && (
            <div className="flex items-center gap-6 text-xs">
              <div className="text-center">
                <div className="text-gray-500">Portfolio</div>
                <div className="font-bold text-white">${Number(account.portfolio_value).toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Cash</div>
                <div className="font-bold text-blue-400">${Number(account.cash).toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Total P&L</div>
                <div className={`font-bold ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">

        {/* Left Column — Search + Watchlist */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <SearchPanel
            onSymbolSelect={handleSymbolSelect}
            watchlist={watchlist}
            onWatchlistUpdate={fetchWatchlist}
          />
          <WatchlistPanel
            watchlist={watchlist}
            onSymbolSelect={handleSymbolSelect}
            onUpdate={fetchWatchlist}
            activeSymbol={symbol}
          />
          <AccountPanel account={account} positions={positions} />
        </div>

        {/* Middle Column — Regime + Trade Gate */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* Tab switcher */}
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('regime')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'regime' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}>
              🌍 Regime Analysis
            </button>
            <button onClick={() => setActiveTab('scanner')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'scanner' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}>
              📡 Scanner
            </button>
          </div>

          {activeTab === 'regime' && (
            <>
              {!symbol && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                  <div className="text-3xl mb-3">🔍</div>
                  <div className="text-sm text-gray-400 mb-1">No symbol selected</div>
                  <div className="text-xs text-gray-600">Search for a symbol or add to watchlist to analyze</div>
                </div>
              )}
              {symbol && (
                <>
                  <div className="bg-gray-800 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Analyzing:</span>
                    <span className="text-sm font-black text-white">{symbol}</span>
                    <button onClick={() => fetchRegime(symbol)}
                      disabled={regimeLoading}
                      className="text-xs text-blue-400 hover:text-blue-300 disabled:text-gray-600">
                      {regimeLoading ? '⏳' : '🔄'}
                    </button>
                  </div>
                  <RegimePanel regime={regime} loading={regimeLoading} symbol={symbol} />
                  <TradeGate regime={regime} symbol={symbol} />
                  <QuickTradePanel symbol={symbol} regime={regime} />
                </>
              )}
            </>
          )}

          {activeTab === 'scanner' && (
            <RegimeScannerPanel
              watchlist={watchlist}
              onSymbolSelect={handleSymbolSelect}
            />
          )}
        </div>

        {/* Right Column — Indicators + Positions */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <IndicatorsPanel regime={regime} loading={regimeLoading} />
          <RegimeHistoryChart symbol={symbol} />
          <PositionsPanel positions={positions} onRefresh={fetchAccountData} />
          <OrdersPanel orders={orders} onRefresh={fetchOrders} />
        </div>

      </div>
    </div>
  )
}