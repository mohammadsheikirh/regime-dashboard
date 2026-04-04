import { useState, useRef, useEffect } from 'react'
import { searchSymbols, aiSearch, addToWatchlist } from '../api'
import { toast } from 'react-hot-toast'

export default function SearchPanel({ onSymbolSelect, watchlist, onWatchlistUpdate }) {
  const [query,      setQuery]      = useState('')
  const [aiQuery,    setAiQuery]    = useState('')
  const [results,    setResults]    = useState([])
  const [aiResults,  setAiResults]  = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [aiLoading,  setAiLoading]  = useState(false)
  const [showDrop,   setShowDrop]   = useState(false)
  const [mode,       setMode]       = useState('search') // 'search' | 'ai'
  const debounceRef = useRef(null)
  const dropRef     = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced search
  const handleSearchChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length < 1) { setResults([]); setShowDrop(false); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchSymbols(val)
        setResults(data.results || [])
        setShowDrop(true)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

const handleAiSearch = async () => {
  if (!aiQuery.trim()) {
    toast.error('Please enter a search query')
    return
  }
  setAiLoading(true)
  setAiResults(null)
  try {
    const data = await aiSearch(aiQuery.trim())
    setAiResults(data)
    if (data.results?.length === 0) {
      toast.error('No results found — try a different query')
    }
  } catch (e) {
    console.error('AI search error:', e)
    toast.error(`AI search failed: ${e.message}`)
  } finally {
    setAiLoading(false)
  }
}

  const handleAddToWatchlist = async (symbol, name) => {
    try {
      await addToWatchlist(symbol, name)
      toast.success(`⭐ ${symbol} added to watchlist`)
      if (onWatchlistUpdate) onWatchlistUpdate()
    } catch (e) {
      toast.error(`Failed to add ${symbol}`)
    }
  }

  const isInWatchlist = (symbol) =>
    watchlist.some(w => w.symbol === symbol)

  const ResultRow = ({ item }) => (
  <div className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg transition-all">
    <div onClick={() => { onSymbolSelect(item.symbol); setShowDrop(false); setQuery('') }}
      className="flex-1 flex items-center gap-2 cursor-pointer min-w-0">
      <div className="w-7 h-7 bg-blue-900 rounded flex items-center justify-center text-xs font-black text-blue-300 flex-shrink-0">
        {item.symbol.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-white">{item.symbol}</div>
        <div className="text-xs text-gray-400 truncate">{item.name}</div>
      </div>
      <div className="text-xs text-gray-500 flex-shrink-0">{item.exchange}</div>
    </div>
    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        onClick={() => handleAddToWatchlist(item.symbol, item.name)}
        title={isInWatchlist(item.symbol) ? 'In watchlist' : 'Add to watchlist'}
        className={`text-sm px-2 py-1 rounded-lg transition-all font-bold ${
          isInWatchlist(item.symbol)
            ? 'text-yellow-400 bg-yellow-900 bg-opacity-30'
            : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-900 hover:bg-opacity-20'
        }`}>
        {isInWatchlist(item.symbol) ? '⭐' : '☆'}
      </button>
      <button
        onClick={() => { onSymbolSelect(item.symbol); setShowDrop(false); setQuery('') }}
        title="Analyze & Trade"
        className="text-xs px-2 py-1 bg-green-900 hover:bg-green-700 text-green-300 rounded-lg transition-all font-bold">
        Trade
      </button>
    </div>
  </div>
)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
        🔍 Instrument Search
      </h2>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode('search')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mode === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}>
          🔤 Symbol Search
        </button>
        <button onClick={() => setMode('ai')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mode === 'ai' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}>
          🤖 AI Search
        </button>
      </div>

      {/* Symbol Search */}
      {mode === 'search' && (
        <div className="relative" ref={dropRef}>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              onFocus={() => results.length > 0 && setShowDrop(true)}
              placeholder="Search by ticker or company name..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 pr-8"
            />
            {loading && (
              <div className="absolute right-3 top-2.5 text-gray-500 text-xs">⏳</div>
            )}
          </div>

          {/* Dropdown */}
          {showDrop && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
              <div className="p-2">
                {results.map(item => <ResultRow key={item.symbol} item={item} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Search */}
{mode === 'ai' && (
  <div>
    <div className="flex gap-2 mb-3">
      <input
        type="text"
        value={aiQuery}
        onChange={e => setAiQuery(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAiSearch() }}
        placeholder='e.g. "show me EV stocks" or "top AI companies"'
        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
      />
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); handleAiSearch(); }}
        disabled={aiLoading || !aiQuery.trim()}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all">
        {aiLoading ? '⏳' : '🤖 Search'}
      </button>
    </div>

    {/* Loading state */}
    {aiLoading && (
      <div className="text-center py-4">
        <div className="text-xs text-gray-400 animate-pulse">🤖 Claude is finding relevant stocks...</div>
      </div>
    )}


{/* AI Results */}
{aiResults && !aiLoading && (
  <div>
    {aiResults.sector && (
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded-full font-bold">
          {aiResults.sector}
        </span>
        <span className="text-xs text-gray-400 leading-relaxed">{aiResults.explanation}</span>
      </div>
    )}
    <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1">
      {aiResults.results?.map(item => (
        <ResultRow key={item.symbol} item={item} />
      ))}
    </div>
    {aiResults.results?.length === 0 && (
      <div className="text-xs text-gray-500 text-center py-4">
        No results found for "{aiResults.query}"
      </div>
    )}
  </div>
)}

    {/* Example queries */}
    {!aiResults && !aiLoading && (
      <div>
        <div className="text-xs text-gray-500 mb-2">Try asking:</div>
        <div className="flex flex-wrap gap-2">
          {['EV stocks', 'AI companies', 'semiconductor stocks', 'biotech stocks', 'bank stocks'].map(q => (
            <button
              type="button"
              key={q}
              onClick={() => { setAiQuery(q); }}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2 py-1 rounded-lg transition-all">
              {q}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
)}
    </div>
  )
}