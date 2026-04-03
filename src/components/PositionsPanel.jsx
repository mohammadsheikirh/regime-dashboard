export default function PositionsPanel({ positions, onRefresh }) {
  const totalPL    = positions.reduce((s, p) => s + Number(p.unrealized_pl  || 0), 0)
  const totalValue = positions.reduce((s, p) => s + Number(p.market_value   || 0), 0)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          📈 Open Positions
        </h2>
        <div className="flex items-center gap-3">
          {positions.length > 0 && (
            <span className={`text-sm font-bold ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)} P&L
            </span>
          )}
          <button onClick={onRefresh}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            🔄 Refresh
          </button>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">📭</div>
          <div className="text-sm text-gray-500">No open positions</div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Positions</div>
              <div className="text-sm font-bold text-white">{positions.length}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500">Market Value</div>
              <div className="text-sm font-bold text-white">
                ${totalValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
              </div>
            </div>
            <div className={`rounded-lg p-2 text-center ${totalPL >= 0 ? 'bg-green-950' : 'bg-red-950'}`}>
              <div className="text-xs text-gray-500">Total P&L</div>
              <div className={`text-sm font-bold ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Position Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 pr-3">Symbol</th>
                  <th className="text-right py-2 pr-3">Qty</th>
                  <th className="text-right py-2 pr-3">Entry</th>
                  <th className="text-right py-2 pr-3">Current</th>
                  <th className="text-right py-2 pr-3">Mkt Value</th>
                  <th className="text-right py-2 pr-3">P&L</th>
                  <th className="text-right py-2">P&L %</th>
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => {
                  const pl    = Number(pos.unrealized_pl   || 0)
                  const plpct = Number(pos.unrealized_plpc || 0)
                  const isPos = pl >= 0
                  return (
                    <tr key={pos.symbol}
                      className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-900 rounded flex items-center justify-center text-xs font-bold text-blue-300">
                            {pos.symbol.slice(0,2)}
                          </div>
                          <span className="font-bold text-white">{pos.symbol}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-right text-gray-300">{pos.qty}</td>
                      <td className="py-2 pr-3 text-right text-gray-300">
                        ${Number(pos.avg_entry_price).toFixed(2)}
                      </td>
                      <td className="py-2 pr-3 text-right text-gray-300">
                        ${Number(pos.current_price || 0).toFixed(2)}
                      </td>
                      <td className="py-2 pr-3 text-right text-gray-300">
                        ${Number(pos.market_value || 0).toFixed(0)}
                      </td>
                      <td className={`py-2 pr-3 text-right font-bold ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                        {isPos ? '+' : ''}${pl.toFixed(2)}
                      </td>
                      <td className={`py-2 text-right font-bold ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                        {isPos ? '+' : ''}{plpct.toFixed(2)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}