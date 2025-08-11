import React from 'react'

export default function OrderRow({ order, onView, onEdit }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'text-success'
      case 'Pickup': return 'text-warning'
      case 'Late': return 'text-danger'
      case 'Returned': return 'text-blue-400'
      default: return 'text-ink-muted'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed': return '✓'
      case 'Pickup': return '🚚'
      case 'Late': return '⚠'
      case 'Returned': return '↩'
      default: return '•'
    }
  }

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-4 py-3">
        <div>
          <div className="font-semibold text-white">{order.id}</div>
          <div className="text-xs text-ink-muted">{order.createdAt}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div>
          <div className="text-white/90 font-medium">{order.customer}</div>
          <div className="text-xs text-ink-muted">{order.customerEmail}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div>
          <div className="text-white/90">{order.item}</div>
          <div className="text-xs text-ink-muted">Qty: {order.quantity}</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div>
          <div className="text-white/80">{order.period}</div>
          <div className="text-xs text-ink-muted">{order.duration} days</div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} bg-white/5`}>
          <span>{getStatusIcon(order.status)}</span>
          {order.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="text-white font-semibold">{order.amount}</div>
        {order.deposit && <div className="text-xs text-ink-muted">Deposit: {order.deposit}</div>}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center gap-2 justify-end">
          <button 
            onClick={() => onView(order)}
            className="btn btn-ghost text-xs px-2 py-1"
          >
            View
          </button>
          <button 
            onClick={() => onEdit(order)}
            className="btn btn-outline text-xs px-2 py-1"
          >
            Edit
          </button>
        </div>
      </td>
    </tr>
  )
}
