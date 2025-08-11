import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import productService from '../services/productService'
import paymentService from '../services/paymentService'
import { authAPI } from '../services/apiService'
import { toast } from 'react-toastify'
import AuthDebug from '../components/AuthDebug'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [rentalType, setRentalType] = useState('daily') // 'hourly', 'daily', 'weekly'
  const [rentalDuration, setRentalDuration] = useState(1)

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
    if (!rentalDuration || rentalDuration <= 0) return 0
    
    let rate = 0
    switch (rentalType) {
      case 'hourly':
        rate = product.baseRates?.hourly || 0
        break
      case 'daily':
        rate = product.baseRates?.daily || 0
        break
      case 'weekly':
        rate = product.baseRates?.weekly || 0
        break
      default:
        rate = product.baseRates?.daily || 0
    }
    
    const rentalAmount = rentalDuration * rate * quantity
    const depositAmount = (product.depositAmount || 0) * quantity
    return rentalAmount + depositAmount
  }

  const calculateRentalAmount = () => {
    if (!rentalDuration || rentalDuration <= 0) return 0
    
    let rate = 0
    switch (rentalType) {
      case 'hourly':
        rate = product.baseRates?.hourly || 0
        break
      case 'daily':
        rate = product.baseRates?.daily || 0
        break
      case 'weekly':
        rate = product.baseRates?.weekly || 0
        break
      default:
        rate = product.baseRates?.daily || 0
    }
    
    return rentalDuration * rate * quantity
  }

  const calculateDepositAmount = () => {
    return (product.depositAmount || 0) * quantity
  }

  const handleRentNow = async () => {
    try {
      // Validate inputs
      if (!rentalDuration || rentalDuration <= 0) {
        toast.error('Please enter rental duration');
        return;
      }

      if (product.unitsAvailable < quantity) {
        toast.error('Insufficient units available');
        return;
      }

      // Check authentication
      try {
        await authAPI.getCurrentUser();
      } catch (authError) {
        toast.error('Please login to continue with payment');
        return;
      }

      setIsProcessingPayment(true);
      
      // Calculate dates based on rental duration
      const today = new Date();
      const endDate = new Date(today);
      
      if (rentalType === 'hourly') {
        endDate.setHours(endDate.getHours() + rentalDuration);
      } else if (rentalType === 'daily') {
        endDate.setDate(endDate.getDate() + rentalDuration);
      } else if (rentalType === 'weekly') {
        endDate.setDate(endDate.getDate() + (rentalDuration * 7));
      }
      
      const orderData = {
        productId: product._id,
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        unitCount: quantity,
        rentalType: rentalType,
        rentalDuration: rentalDuration,
        totalAmount: calculateTotal(),
        rentalAmount: calculateRentalAmount(),
        depositAmount: calculateDepositAmount()
      };

      console.log('📋 Processing payment with data:', orderData);

      const result = await paymentService.initializeRazorpayPayment(orderData);
      
      if (result.success) {
        toast.success('Payment successful! Your booking has been confirmed.');
        navigate('/orders');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  }

  // Get the first image for display
  const mainImage = product.images && product.images.length > 0 ? product.images[0].url : null

  return (
    <div className="space-y-6">
      {/* Temporary Auth Debug Component */}
      <AuthDebug />
      
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
               
               {/* Rental Type Selection */}
               <div>
                 <label className="text-sm text-ink-muted mb-2 block">Rental Type</label>
                 <select 
                   className="input"
                   value={rentalType}
                   onChange={(e) => setRentalType(e.target.value)}
                 >
                   <option value="hourly">Hourly</option>
                   <option value="daily">Daily</option>
                   <option value="weekly">Weekly</option>
                 </select>
               </div>
               
               {/* Rental Duration */}
               <div>
                 <label className="text-sm text-ink-muted mb-2 block">
                   Duration ({rentalType === 'hourly' ? 'Hours' : rentalType === 'daily' ? 'Days' : 'Weeks'})
                 </label>
                 <input 
                   type="number" 
                   min="1"
                   className="input"
                   value={rentalDuration}
                   onChange={(e) => setRentalDuration(parseInt(e.target.value) || 1)}
                 />
               </div>
               
               <div className="border-t border-border/30 pt-4">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-white/80">Rental Amount</span>
                   <span className="text-white">₹{calculateRentalAmount()}</span>
                 </div>
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-white/80">Deposit Amount</span>
                   <span className="text-white">₹{calculateDepositAmount()}</span>
                 </div>
                 <div className="flex items-center justify-between text-lg font-semibold">
                   <span className="text-white">Total</span>
                   <span className="text-primary">₹{calculateTotal()}</span>
                 </div>
               </div>

               <button 
                 className="btn btn-primary w-full" 
                 disabled={!rentalDuration || product.unitsAvailable === 0 || isProcessingPayment}
                 onClick={handleRentNow}
               >
                 {isProcessingPayment ? 'Processing Payment...' : 
                  product.unitsAvailable === 0 ? 'Not Available' : 'Rent Now'}
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
