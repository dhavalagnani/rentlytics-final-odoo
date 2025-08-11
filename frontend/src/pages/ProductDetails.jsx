import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import productService from '../services/productService'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDates, setSelectedDates] = useState({ start: '', end: '' })
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const productData = await productService.getProductById(id)
        if (productData) {
          setProduct(productData)
        } else {
          setError('Product not found')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setError('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading product details...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-white text-lg mb-4">{error || 'Product not found'}</div>
          <button 
            onClick={() => navigate('/catalog')}
            className="btn btn-primary"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    )
  }

  const calculateTotal = () => {
    if (!selectedDates.start || !selectedDates.end) return 0
    const start = new Date(selectedDates.start)
    const end = new Date(selectedDates.end)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return days * (product.baseRates?.daily || 0) * quantity
  }

  // Get the first image for display
  const mainImage = product.images && product.images.length > 0 ? product.images[0].url : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/catalog')}
          className="btn btn-ghost"
        >
          ← Back to Catalog
        </button>
        <h2 className="text-2xl font-bold text-white">{product.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Images */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <div className="aspect-video bg-gradient-to-br from-primary/30 to-accent/30 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
              {mainImage ? (
                <img 
                  src={mainImage} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-6xl">📷</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.slice(1).map((image, i) => (
                  <div key={i} className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors overflow-hidden">
                    <img 
                      src={image.url} 
                      alt={`${product.name} ${i + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="card p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Product Details</h3>
            <p className="text-white/80 mb-4">{product.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-sm text-ink-muted">Category</div>
                <div className="text-white font-medium">{product.categoryId?.name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-ink-muted">Owner</div>
                <div className="text-white font-medium">{product.ownerId?.firstName} {product.ownerId?.lastName}</div>
              </div>
              <div>
                <div className="text-sm text-ink-muted">Units Available</div>
                <div className="text-white font-medium">{product.unitsAvailable}</div>
              </div>
              <div>
                <div className="text-sm text-ink-muted">Available</div>
                <div className={`font-medium ${product.unitsAvailable > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {product.unitsAvailable > 0 ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            {product.rules && (
              <>
                <h4 className="text-white font-semibold mb-3">Rental Rules</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <li className="flex items-center gap-2 text-white/80">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Min Rental Hours: {product.rules.minRentalHours || 'Not specified'}
                  </li>
                  <li className="flex items-center gap-2 text-white/80">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Max Rental Days: {product.rules.maxRentalDays || 'Not specified'}
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="text-white font-semibold text-lg mb-4">Pricing</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Hourly Rate</span>
                <span className="text-white font-semibold">₹{product.baseRates?.hourly || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Daily Rate</span>
                <span className="text-white font-semibold">₹{product.baseRates?.daily || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Weekly Rate</span>
                <span className="text-white font-semibold">₹{product.baseRates?.weekly || 0}</span>
              </div>
              {product.depositAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Deposit Amount</span>
                  <span className="text-white font-semibold">₹{product.depositAmount}</span>
                </div>
              )}
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
                  {Array.from({ length: Math.min(product.unitsAvailable, 5) }, (_, i) => i + 1).map(num => (
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

              <button 
                className="btn btn-primary w-full" 
                disabled={!selectedDates.start || !selectedDates.end || product.unitsAvailable === 0}
              >
                {product.unitsAvailable === 0 ? 'Not Available' : 'Reserve Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Availability Blocks */}
      {product.availabilityBlocks && product.availabilityBlocks.length > 0 && (
        <div className="card p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Unavailable Periods</h3>
          <div className="space-y-3">
            {product.availabilityBlocks.map((block, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div>
                  <div className="text-white font-medium">
                    {new Date(block.startDate).toLocaleDateString()} - {new Date(block.endDate).toLocaleDateString()}
                  </div>
                  {block.reason && (
                    <div className="text-white/60 text-sm">{block.reason}</div>
                  )}
                </div>
                <div className="text-red-400 text-sm">Unavailable</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
