import React from 'react'

export default function NotificationItem({ notification, onMarkRead, onDelete }) {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reminder': return '⏰'
      case 'payment': return '💰'
      case 'late_fee': return '⚠️'
      case 'pickup': return '📦'
      case 'return': return '↩️'
      default: return '📢'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'reminder': return 'text-blue-400'
      case 'payment': return 'text-green-400'
      case 'late_fee': return 'text-red-400'
      case 'pickup': return 'text-sky-400'
      case 'return': return 'text-lime-400'
      default: return 'text-white/80'
    }
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${notification.read ? 'bg-white/5' : 'bg-primary/10'}`}>
      <div className={`text-lg ${getNotificationColor(notification.type)}`}>
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={`text-sm ${notification.read ? 'text-white/70' : 'text-white'} font-medium`}>
              {notification.title}
            </p>
            <p className="text-xs text-ink-muted mt-1">
              {notification.message}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-ink-muted">{notification.time}</span>
              {notification.orderId && (
                <span className="text-xs text-primary">Order #{notification.orderId}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!notification.read && (
              <button 
                onClick={() => onMarkRead(notification.id)}
                className="text-xs text-primary hover:text-primary/80"
              >
                Mark Read
              </button>
            )}
            <button 
              onClick={() => onDelete(notification.id)}
              className="text-xs text-ink-muted hover:text-danger"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
