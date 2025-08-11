import React, { useState } from 'react'

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState('my-rentals')
  
  const customerRentals = [
    {
      id: 'RNT-1042',
      product: '4K Cinema Camera',
      status: 'Active',
      startDate: '2024-03-12',
      endDate: '2024-03-14',
      amount: '₹24,500',
      pickupTime: '09:30 AM',
      returnTime: '06:00 PM'
    },
    {
      id: 'RNT-1038',
      product: 'DJI Drone Pro',
      status: 'Completed',
      startDate: '2024-03-08',
      endDate: '2024-03-10',
      amount: '₹12,000',
      pickupTime: '10:00 AM',
      returnTime: '05:00 PM'
    }
  ]

  const availableProducts = [
    {
      id: 1,
      name: '4K Cinema Camera',
      price: '₹10/hr',
      available: true,
      image: '📹'
    },
    {
      id: 2,
      name: 'Projector Pro X',
      price: '₹60/day',
      available: true,
      image: '📽️'
    },
    {
      id: 3,
      name: 'Audio Kit Premium',
      price: '₹300/week',
      available: false,
      image: '🎤'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Customer Portal</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-muted">Welcome back, John Doe</span>
          <button className="btn btn-primary">New Rental</button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-6 mb-6">
          <button 
            onClick={() => setActiveTab('my-rentals')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'my-rentals' 
                ? 'bg-primary text-white' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            My Rentals
          </button>
          <button 
            onClick={() => setActiveTab('available-products')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'available-products' 
                ? 'bg-primary text-white' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            Available Products
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'billing' 
                ? 'bg-primary text-white' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            Billing & Payments
          </button>
        </div>

        {activeTab === 'my-rentals' && (
          <div className="space-y-4">
            {customerRentals.map(rental => (
              <div key={rental.id} className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{rental.product}</h3>
                    <p className="text-sm text-ink-muted">Order #{rental.id}</p>
                  </div>
                  <span className={`chip ${
                    rental.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {rental.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-ink-muted">Period</div>
                    <div className="text-white">{rental.startDate} - {rental.endDate}</div>
                  </div>
                  <div>
                    <div className="text-ink-muted">Amount</div>
                    <div className="text-white font-semibold">{rental.amount}</div>
                  </div>
                  <div>
                    <div className="text-ink-muted">Pickup</div>
                    <div className="text-white">{rental.pickupTime}</div>
                  </div>
                  <div>
                    <div className="text-ink-muted">Return</div>
                    <div className="text-white">{rental.returnTime}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button className="btn btn-outline text-sm">View Details</button>
                  {rental.status === 'Active' && (
                    <button className="btn btn-primary text-sm">Extend Rental</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'available-products' && (
          <div className="grid grid-auto-fill gap-4">
            {availableProducts.map(product => (
              <div key={product.id} className="card p-4">
                <div className="text-3xl mb-3">{product.image}</div>
                <h3 className="text-white font-semibold mb-2">{product.name}</h3>
                <div className="text-sm text-ink-muted mb-3">Pricing: {product.price}</div>
                <button 
                  className={`btn w-full ${product.available ? 'btn-primary' : 'btn-ghost'}`}
                  disabled={!product.available}
                >
                  {product.available ? 'Reserve Now' : 'Currently Unavailable'}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-white">₹36,500</div>
                <div className="text-sm text-ink-muted">Total Spent</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-white">₹2,400</div>
                <div className="text-sm text-ink-muted">Outstanding</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-white">8</div>
                <div className="text-sm text-ink-muted">Total Rentals</div>
              </div>
            </div>
            <div className="card p-4">
              <h3 className="text-white font-semibold mb-3">Recent Transactions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-white">Order #RNT-1042</div>
                    <div className="text-xs text-ink-muted">4K Cinema Camera</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white">₹24,500</div>
                    <div className="text-xs text-green-400">Paid</div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-white">Order #RNT-1038</div>
                    <div className="text-xs text-ink-muted">DJI Drone Pro</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white">₹12,000</div>
                    <div className="text-xs text-green-400">Paid</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
