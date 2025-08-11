import React, { useState, useEffect } from 'react'
import OrderRow from '../components/OrderRow'
import orderService from '../services/orderService'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})

  useEffect(() => {
    loadOrders()
    loadStats()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await orderService.getAllOrders()
      setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await orderService.getOrderStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleViewOrder = (order) => {
    alert(`Viewing order ${order.id}`)
  }

  const handleEditOrder = (order) => {
    alert(`Editing order ${order.id}`)
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      loadOrders() // Reload orders to get updated data
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Orders</h2>
        <div className="flex gap-4 text-sm">
          <div className="text-white/60">Total: <span className="text-white">{stats.total}</span></div>
          <div className="text-green-400">Confirmed: <span className="text-white">{stats.confirmed}</span></div>
          <div className="text-blue-400">Pickup: <span className="text-white">{stats.pickup}</span></div>
          <div className="text-red-400">Late: <span className="text-white">{stats.late}</span></div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                {['Order', 'Customer', 'Item', 'Period', 'Status', 'Amount', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {orders.map(order => (
                <OrderRow 
                  key={order.id} 
                  order={order}
                  onView={handleViewOrder}
                  onEdit={handleEditOrder}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {orders.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-white/60">No orders found</div>
        </div>
      )}
    </div>
  )
}

export default Orders
