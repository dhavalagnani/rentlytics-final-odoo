import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/apiService'
import { toast } from 'react-toastify'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user/bookings')
      setOrders(response.data.data.bookings || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-300'
      case 'pending':
        return 'text-yellow-300'
      case 'cancelled':
        return 'text-red-300'
      case 'returned':
        return 'text-blue-300'
      default:
        return 'text-gray-300'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
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
        <h2 className="text-2xl font-bold text-white">My Orders</h2>
        <button 
          onClick={() => navigate('/catalog')}
          className="btn btn-primary"
        >
          Browse More Products
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-white text-lg font-semibold mb-2">No Orders Yet</h3>
          <p className="text-white/60 mb-4">Start exploring our catalog to rent products</p>
          <button 
            onClick={() => navigate('/catalog')}
            className="btn btn-primary"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg overflow-hidden flex-shrink-0">
                    {order.productId?.images && order.productId.images.length > 0 ? (
                      <img 
                        src={order.productId.images[0].url} 
                        alt={order.productId.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/60">
                        📷
                      </div>
                    )}
                  </div>
                  
                  {/* Order Details */}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">
                      {order.productId?.name || 'Product'}
                    </h3>
                    <div className="text-white/60 text-sm mt-1">
                      Order ID: {order.bookingId}
                    </div>
                                         <div className="flex items-center space-x-4 mt-2 text-sm">
                       <div>
                         <span className="text-white/60">Start:</span>
                         <span className="text-white ml-1">{formatDate(order.startDate)}</span>
                       </div>
                       <div>
                         <span className="text-white/60">End:</span>
                         <span className="text-white ml-1">{formatDate(order.endDate)}</span>
                       </div>
                       <div>
                         <span className="text-white/60">Quantity:</span>
                         <span className="text-white ml-1">{order.unitCount}</span>
                       </div>
                       <div>
                         <span className="text-white/60">Rental:</span>
                         <span className="text-white ml-1">{order.rentalDuration} {order.rentalType}</span>
                       </div>
                     </div>
                  </div>
                </div>
                
                {/* Status and Amount */}
                <div className="text-right">
                  <div className={`font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                  <div className="text-white font-semibold text-lg mt-1">
                    {formatCurrency(order.pricingSnapshot?.totalPrice || 0)}
                  </div>
                  <div className="text-white/60 text-sm mt-1">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>
              
              {/* Additional Details */}
                             <div className="mt-4 pt-4 border-t border-border/30">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                   <div>
                     <span className="text-white/60">Duration:</span>
                     <div className="text-white">{order.durationDays} days</div>
                   </div>
                   <div>
                     <span className="text-white/60">Rental Amount:</span>
                     <div className="text-white">{formatCurrency(order.pricingSnapshot?.rentalAmount || 0)}</div>
                   </div>
                   <div>
                     <span className="text-white/60">Deposit:</span>
                     <div className="text-white">{formatCurrency(order.pricingSnapshot?.deposit || 0)}</div>
                   </div>
                   <div>
                     <span className="text-white/60">Payment Status:</span>
                     <div className={`${order.paymentStatus === 'paid' ? 'text-green-300' : 'text-yellow-300'}`}>
                       {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                     </div>
                   </div>
                   <div>
                     <span className="text-white/60">Owner:</span>
                     <div className="text-white">
                       {order.productId?.ownerId?.firstName} {order.productId?.ownerId?.lastName}
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
