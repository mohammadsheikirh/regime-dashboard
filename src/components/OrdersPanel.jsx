const STATUS_STYLES = {
  filled:           'bg-green-900 text-green-300',
  accepted:         'bg-blue-900 text-blue-300',
  new:              'bg-yellow-900 text-yellow-300',
  partially_filled: 'bg-orange-900 text-orange-300',
  canceled:         'bg-gray-700 text-gray-400',
  rejected:         'bg-red-900 text-red-300',
  pending_new:      'bg-yellow-900 text-yellow-300',
  done_for_day:     'bg-gray-700 text-gray-400',
}

const STATUS_ICONS = {
  filled:           '✅',
  accepted:         '⏳',
  new:              '🆕',
  partially_filled: '⚡',
  canceled:         '❌',
  rejected:         '🚫',
  pending_new:      '🔄',
}

export default function OrdersPanel({ orders, onRefresh }) {
  const filled   = orders.filter(o => o.status === 'filled').length
  const pending  = orders.filter(o => ['accepted', 'new', 'pending_new', 'partially_filled'].includes(o.status)).length
  const canceled = orders.filter(o => ['canceled', 'rejected'].includes(o.status)).length

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
          📋 Order History
        </h2>
        <button onClick={onRefresh}
          className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
          🔄 Refresh
        </button>
      </div>

      {/* Summary */}
      {orders.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-green-950 border border-green-900 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-500">Filled</div>
            <div className="text-sm font-bold text-green-400">{filled}</div>
          </div>
          <div className="bg-blue-950 border border-blue-900 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-500">Pending</div>
            <div className="text-sm font-bold text-blue-400">{pending}</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-center">
            <div className="text-xs text-gray-500">Canceled</div>
            <div className="text-sm font-bold text-gray-400">{canceled}</div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">📭</div>
          <div className="text-sm text-gray-500">No orders yet</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-2 pr-3">Symbol</th>
                <th className="text-left py-2 pr-3">Side</th>
                <th className="text-right py-2 pr-3">Qty</th>
                <th className="text-right py-2 pr-3">Filled</th>
                <th className="text-right py-2 pr-3">Fill Price</th>
                <th className="text-left py-2 pr-3">Type</th>
                <th className="text-left py-2 pr-3">Status</th>
                <th className="text-left py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.order_id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                  <td className="py-2 pr-3 font-bold text-white">{order.symbol}</td>
                  <td className={`py-2 pr-3 font-bold ${order.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    {order.side?.toUpperCase()}
                  </td>
                  <td className="py-2 pr-3 text-right text-gray-300">{order.qty}</td>
                  <td className="py-2 pr-3 text-right text-gray-300">{order.filled_qty || 0}</td>
                  <td className="py-2 pr-3 text-right text-gray-300">
                    {order.filled_avg_price ? `$${Number(order.filled_avg_price).toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2 pr-3 text-gray-400 uppercase">{order.order_type}</td>
                  <td className="py-2 pr-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[order.status] || 'bg-gray-800 text-gray-400'}`}>
                      {STATUS_ICONS[order.status] || '•'} {order.status?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500">{order.submitted_at || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}