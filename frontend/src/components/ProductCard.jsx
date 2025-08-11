import React from 'react'

export default function ProductCard({ product, onView, onRent }) {
  // Get the first image from the product's images array
  const productImage = product.images && product.images.length > 0 ? product.images[0].url : null;
  
  // Get pricing information
  const getPricingText = () => {
    if (product.baseRates) {
      const rates = product.baseRates;
      // Show daily rate as primary pricing
      if (rates.daily && rates.daily > 0) {
        return `₹${rates.daily}/day`;
      } else if (rates.hourly && rates.hourly > 0) {
        return `₹${rates.hourly}/hour`;
      } else if (rates.weekly && rates.weekly > 0) {
        return `₹${rates.weekly}/week`;
      }
    }
    return 'Price on request';
  };

  // Get detailed pricing for debugging
  const getDetailedPricing = () => {
    if (product.baseRates) {
      const rates = product.baseRates;
      return {
        hourly: rates.hourly || 0,
        daily: rates.daily || 0,
        weekly: rates.weekly || 0
      };
    }
    return { hourly: 0, daily: 0, weekly: 0 };
  };

  // Check if product is available
  const isAvailable = product.unitsAvailable > 0;

  return (
    <div className="card overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
      {/* Product Image */}
      <div className="h-48 bg-gradient-to-br from-primary/30 to-accent/30 relative overflow-hidden cursor-pointer" onClick={() => onView(product)}>
        {productImage ? (
          <img 
            src={productImage} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Fallback gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 ${productImage ? 'hidden' : 'flex'} items-center justify-center`}>
          <div className="text-white/60 text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">No Image</p>
          </div>
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Category tag */}
        <div className="absolute top-3 left-3">
          <span className="chip bg-primary/20 text-primary-300 text-xs">
            {product.categoryId?.name || 'Category'}
          </span>
        </div>
        
        {/* Availability tag */}
        <div className="absolute top-3 right-3">
          <span className={`chip text-xs ${isAvailable ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-semibold text-lg line-clamp-1">{product.name}</h3>
          <p className="text-sm text-ink-muted mt-1 line-clamp-2">{product.description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-ink-muted">
            <div className="font-medium text-primary-300">{getPricingText()}</div>
            <div className="text-xs">Units: {product.unitsAvailable || 0}</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button 
            onClick={() => onView(product)}
            className="btn btn-ghost flex-1 text-sm"
          >
            View Details
          </button>
          <button 
            onClick={() => onRent(product)}
            className="btn btn-primary flex-1 text-sm"
            disabled={!isAvailable}
          >
            {isAvailable ? 'Rent Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  )
}
