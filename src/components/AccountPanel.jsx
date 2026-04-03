export default function AccountPanel({ account, positions }) {
  if (!account) return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="text-xs text-gray-500">Loading account...</div>
    </div>
  )

  const equity     = Number(account.equity)
  const cash       = Number(account.cash)
  const buyPower   = Number(account.buying_power)
  const portfolio  = Number(account.portfolio_value)
  const totalPL    = positions.reduce((s, p) => s + Number(p.unrealized_pl || 0), 0)
  const totalValue = positions.reduce((s, p) => s + Number(p.market_value  || 0), 0)
  const invested   = portfolio - cash
  const investPct  = portfolio > 0 ? (invested / portfolio) * 100 : 0

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
        💰 Account Overview
      </h2>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full font-bold">
          ● {account.status}
        </span>
        <span className="text-xs text-gray-500">Alpaca Paper · {account.currency}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Portfolio Value</div>
          <div className="text-lg font-bold text-white">${portfolio.toLocaleString()}</div>
        </div>
        <div className={`rounded-lg p-3 ${totalPL >= 0 ? 'bg-green-950' : 'bg-red-950'}`}>
          <div className="text-xs text-gray-500 mb-1">Total P&L</div>
          <div className={`text-lg font-bold ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Cash</div>
          <div className="text-sm font-bold text-blue-400">${cash.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Buying Power</div>
          <div className="text-sm font-bold text-green-400">${buyPower.toLocaleString()}</div>
        </div>
      </div>

      {/* Capital Allocation */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Capital Allocated</span>
          <span className="text-gray-400">{investPct.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="h-2 rounded-full bg-blue-500 transition-all"
            style={{ width: `${Math.min(investPct, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="text-blue-400">Invested: ${invested.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
          <span className="text-gray-500">Cash: ${cash.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
      </div>

      {/* Positions count */}
      <div className="bg-gray-800 rounded-lg p-2 text-center text-xs text-gray-400">
        {positions.length} open position{positions.length !== 1 ? 's' : ''} · Market Value: ${totalValue.toLocaleString(undefined, {maximumFractionDigits:0})}
      </div>
    </div>
  )
}