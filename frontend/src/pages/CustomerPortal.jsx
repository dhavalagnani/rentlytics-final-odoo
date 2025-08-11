import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import orderService from '../services/orderService'
import productService from '../services/productService'
import layoutService from '../services/layoutService'

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState('my-rentals')
  const [customerRentals, setCustomerRentals] = useState([])
  const [availableProducts, setAvailableProducts] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load user profile
      const profile = await layoutService.getUserProfile()
      setUserProfile(profile)
      
      // Load user rentals
      if (profile?.id) {
        const rentals = await orderService.getUserOrders(profile.id)
        setCustomerRentals(rentals)
      }
      
      // Load available products
      const products = await productService.getAllProducts()
      setAvailableProducts(products)
      
    } catch (error) {
      console.error('Error loading customer portal data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleNewRental = () => {
    // Navigate to catalog or rental form
    window.location.href = '/catalog'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Customer Portal</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-muted">
            Welcome back, {userProfile?.firstName || 'User'}
          </span>
          <button 
            onClick={handleNewRental}
            className="btn btn-primary"
          >
            New Rental
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-surface rounded-lg p-1">
        <button
          onClick={() => setActiveTab('my-rentals')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'my-rentals'
              ? 'bg-primary text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          My Rentals
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'available'
              ? 'bg-primary text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Available Equipment
        </button>
      </div>

      {/* Content */}
      {activeTab === 'my-rentals' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">My Rentals</h3>
          {customerRentals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No rentals found</p>
              <button 
                onClick={handleNewRental}
                className="mt-4 btn btn-primary"
              >
                Start Your First Rental
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {customerRentals.map((rental) => (
                <div key={rental.id} className="bg-surface border border-border/40 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{rental.product}</h4>
                      <p className="text-sm text-white/60">
                        {rental.startDate} - {rental.endDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rental.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        rental.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {rental.status}
                      </span>
                      <p className="text-sm text-white/60 mt-1">{rental.amount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'available' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Available Equipment</h3>
          {availableProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No products available</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableProducts.map((product) => (
                <div key={product.id} className="bg-surface border border-border/40 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{product.image || '📦'}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.available 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {product.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <h4 className="font-medium text-white mb-1">{product.name}</h4>
                  <p className="text-sm text-white/60">{product.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
