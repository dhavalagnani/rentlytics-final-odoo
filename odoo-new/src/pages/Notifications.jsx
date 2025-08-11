import React from 'react'
import NotificationItem from '../components/NotificationItem'

function Notifications() {
  const notifications = [
    {
      id: 1,
      type: 'reminder',
      title: 'Return Reminder',
      message: 'Lens EF 70-200mm is due for return in 2 days',
      time: '2 hours ago',
      orderId: 'RNT-1042',
      read: false
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: 'Deposit payment received for Order #RNT-1042',
      time: '1 day ago',
      orderId: 'RNT-1042',
      read: true
    },
    {
      id: 3,
      type: 'late_fee',
      title: 'Late Fee Applied',
      message: 'Late fee of ₹200 applied to Order #RNT-0991',
      time: '3 days ago',
      orderId: 'RNT-0991',
      read: true
    },
    {
      id: 4,
      type: 'pickup',
      title: 'Pickup Scheduled',
      message: 'Pickup scheduled for tomorrow at 09:30 AM',
      time: '1 week ago',
      orderId: 'RNT-1039',
      read: true
    }
  ]

  const handleMarkRead = (id) => {
    alert(`Marking notification ${id} as read`)
  }

  const handleDelete = (id) => {
    alert(`Deleting notification ${id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Notifications</h2>
        <button className="btn btn-primary">Configure Settings</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {notifications.map(notification => (
                <NotificationItem 
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-ink-muted">Lead Time (days)</label>
              <input className="input mt-1" defaultValue={2} type="number" />
            </div>
            <div>
              <label className="text-sm text-ink-muted">Customer Channel</label>
              <select className="input mt-1">
                <option>Email</option>
                <option>Portal</option>
                <option>Both</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-ink-muted">End User Channel</label>
              <select className="input mt-1">
                <option>Email</option>
                <option>Portal</option>
                <option>Both</option>
              </select>
            </div>
            <button className="btn btn-primary w-full">Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications
