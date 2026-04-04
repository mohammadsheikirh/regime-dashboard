import { toast } from 'react-hot-toast'
import { removeFromWatchlist } from '../api'

export default function WatchlistPanel({ watchlist, onSymbolSelect, onUpdate, activeSymbol }) {
  const handleRemove = async (symbol) => {
    try {
      await removeFromWatchlist(symbol)
      toast.success(`${symbol} removed from watchlist`)
      if (onUpdate) onUpdate()
    } catch (e) {
      toast.error(`Failed to remove ${symbol}`)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          ⭐ Watchlist
        </h2>
        <span className="text-xs text-gray-500">{watchlist.length}/20 symbols</span>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-2xl mb-2">⭐</div>
          <div className="text-xs text-gray-500">No symbols in watchlist</div>
          <div className="text-xs text-gray-600 mt-1">
            Search for symbols and click ☆ to add
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {watchlist.map(item => (
            <div key={item.symbol}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                activeSymbol === item.symbol
                  ? 'bg-blue-950 border-blue-700'
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
              }`}>
              <div onClick={() => onSymbolSelect(item.symbol)} className="flex-1 flex items-center gap-2">
                <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-black ${
                  activeSymbol === item.symbol ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-300'
                }`}>
                  {item.symbol.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white">{item.symbol}</div>
                  <div className="text-xs text-gray-500 truncate">{item.name}</div>
                </div>
                {activeSymbol === item.symbol && (
                  <span className="text-xs text-blue-400">● Active</span>
                )}
              </div>
              <button
                onClick={() => handleRemove(item.symbol)}
                className="text-gray-600 hover:text-red-400 transition-colors text-sm px-1">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Watchlist capacity bar */}
      {watchlist.length > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div className="h-1 rounded-full bg-blue-500 transition-all"
              style={{ width: `${(watchlist.length / 20) * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}