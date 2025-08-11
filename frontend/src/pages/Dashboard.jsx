import React, { useState, useEffect } from 'react'
import dashboardService from '../services/dashboardService'

function Stat({ label, value, trend, loading = false }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-ink-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">
        {loading ? '...' : value}
      </div>
      {trend && <div className={`mt-2 text-xs ${trend.includes('+') ? 'text-success' : 'text-danger'}`}>{trend} vs last period</div>}
    </div>
  )
}

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const data = await dashboardService.getDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`
    }
    return `₹${amount}`
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Active Rentals" value="..." loading={true} />
          <Stat label="Total Bookings" value="..." loading={true} />
          <Stat label="Late Returns" value="..." loading={true} />
          <Stat label="Total Spent" value="..." loading={true} />
        </section>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-white text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat 
          label="Active Rentals" 
          value={dashboardData?.totalActiveRentals || 0} 
        />
        <Stat 
          label="Total Bookings" 
          value={dashboardData?.totalBookings || 0} 
        />
        <Stat 
          label="Late Returns" 
          value={dashboardData?.lateReturnsCount || 0} 
        />
        <Stat 
          label="Total Spent" 
          value={formatCurrency(dashboardData?.totalAmountSpent || 0)} 
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
          <div className="mt-4 space-y-3">
            {dashboardData?.recentBookings && dashboardData.recentBookings.length > 0 ? (
              dashboardData.recentBookings.map((booking, i) => (
                <div key={i} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-ink-muted">{formatDate(booking.createdAt)}</div>
                    <div className="font-medium text-white">
                      {booking.productId?.name || 'Product'}
                    </div>
                    <div className="text-xs text-white/70">
                      {booking.status} • {formatCurrency(booking.pricingSnapshot?.totalPrice || 0)}
                    </div>
                  </div>
                  <span className={`chip ${
                    booking.status === 'pickedup' ? 'text-green-300' : 
                    booking.status === 'returned' ? 'text-blue-300' : 
                    booking.status === 'confirmed' ? 'text-yellow-300' :
                    'text-gray-300'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/60">
                No recent bookings found
              </div>
            )}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white">Most Rented Products</h3>
          <div className="mt-4 space-y-3">
            {dashboardData?.mostRentedProducts && dashboardData.mostRentedProducts.length > 0 ? (
              dashboardData.mostRentedProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{product.name}</div>
                    <div className="text-xs text-white/70">{product.count} rentals</div>
                  </div>
                  <span className="chip text-primary-300">{product.count}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/60">
                No rental data available
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Transactions Section */}
      {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 && (
        <section className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 text-sm text-ink-muted">Date</th>
                  <th className="text-left py-2 text-sm text-ink-muted">Order ID</th>
                  <th className="text-left py-2 text-sm text-ink-muted">Amount</th>
                  <th className="text-left py-2 text-sm text-ink-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentTransactions.map((transaction, i) => (
                  <tr key={i} className="border-b border-border/10">
                    <td className="py-3 text-sm text-white">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="py-3 text-sm text-white">
                      {transaction.orderId?._id || 'N/A'}
                    </td>
                    <td className="py-3 text-sm text-white">
                      {formatCurrency(transaction.amount || 0)}
                    </td>
                    <td className="py-3">
                      <span className={`chip text-xs ${
                        transaction.status === 'success' ? 'text-green-300' : 
                        transaction.status === 'failed' ? 'text-red-300' : 
                        'text-yellow-300'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

export default Dashboard
