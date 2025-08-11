import React, { useState } from 'react'

export default function ProductDetails() {
  const [selectedDates, setSelectedDates] = useState({ start: '', end: '' })
  const [quantity, setQuantity] = useState(1)
  
  const product = {
    id: 1,
    name: '4K Cinema Camera Pro',
    description: 'Professional 4K cinema camera with advanced features for film production. Includes tripod, lenses, and carrying case.',
    price: {
      hourly: '₹10',
      daily: '₹60', 
      weekly: '₹300'
    },
    specs: [
      '4K Ultra HD Resolution',
      'Interchangeable Lenses',
      'Professional Audio Inputs',
      'HDMI Output',
      'SD Card Storage',
      'Battery Life: 4 hours'
    ],
    availability: [
      { date: '2024-03-15', available: true },
      { date: '2024-03-16', available: false },
      { date: '2024-03-17', available: true },
      { date: '2024-03-18', available: true },
      { date: '2024-03-19', available: false },
      { date: '2024-03-20', available: true },
      { date: '2024-03-21', available: true }
    ],
    images: ['📹', '📷', '🎥'],
    category: 'Camera Equipment',
    condition: 'Excellent',
    location: 'Main Warehouse'
  }

  const calculateTotal = () => {
    if (!selectedDates.start || !selectedDates.end) return 0
    const start = new Date(selectedDates.start)
    const end = new Date(selectedDates.end)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return days * parseInt(product.price.daily) * quantity
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button className="btn btn-ghost">← Back to Catalog</button>
        <h2 className="text-2xl font-bold text-white">{product.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Images */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="aspect-video bg-gradient-to-br from-primary/30 to-accent/30 rounded-xl flex items-center justify-center text-6xl mb-4">
              {product.images[0]}
            </div>
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <div key={i} className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center text-2xl cursor-pointer hover:bg-white/20 transition-colors">
                  {img}
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="card p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Product Details</h3>
            <p className="text-white/80 mb-4">{product.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-sm text-ink-muted">Category</div>
                <div className="text-white font-medium">{product.category}</div>
              </div>
              <div>
                <div className="text-sm text-ink-muted">Condition</div>
                <div className="text-white font-medium">{product.condition}</div>
              </div>
              <div>
                <div className="text-sm text-ink-muted">Location</div>
                <div className="text-white font-medium">{product.location}</div>
              </div>
              <div>
                <div className="text-sm text-ink-muted">Available</div>
                <div className="text-green-400 font-medium">Yes</div>
              </div>
            </div>

            <h4 className="text-white font-semibold mb-3">Specifications</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.specs.map((spec, i) => (
                <li key={i} className="flex items-center gap-2 text-white/80">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {spec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Booking Form */}
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Pricing</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Hourly Rate</span>
                <span className="text-white font-semibold">₹{product.price.hourly}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Daily Rate</span>
                <span className="text-white font-semibold">₹{product.price.daily}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Weekly Rate</span>
                <span className="text-white font-semibold">₹{product.price.weekly}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Book This Item</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-ink-muted mb-2 block">Start Date</label>
                <input 
                  type="date" 
                  className="input"
                  value={selectedDates.start}
                  onChange={(e) => setSelectedDates(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-ink-muted mb-2 block">End Date</label>
                <input 
                  type="date" 
                  className="input"
                  value={selectedDates.end}
                  onChange={(e) => setSelectedDates(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-ink-muted mb-2 block">Quantity</label>
                <select 
                  className="input"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                >
                  {[1,2,3,4,5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div className="border-t border-border/30 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80">Subtotal</span>
                  <span className="text-white">₹{calculateTotal()}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80">Deposit (20%)</span>
                  <span className="text-white">₹{Math.round(calculateTotal() * 0.2)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-primary">₹{calculateTotal()}</span>
                </div>
              </div>

              <button className="btn btn-primary w-full" disabled={!selectedDates.start || !selectedDates.end}>
                Reserve Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Calendar */}
      <div className="card p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Availability Calendar</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="p-2 text-center text-white/80 font-medium text-sm">
              {day}
            </div>
          ))}
          {product.availability.map((item, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-lg text-center text-sm ${
                item.available 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              <div className="font-medium">{new Date(item.date).getDate()}</div>
              <div className="text-xs">{item.available ? 'Available' : 'Booked'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
