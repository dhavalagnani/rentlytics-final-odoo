import React from 'react'

export default function ProductCard({ product, onView, onReserve }) {
  return (
    <div className="card overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
      <div className="h-36 bg-gradient-to-br from-primary/30 to-accent/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-3 right-3">
          <span className={`chip ${product.tag === 'New' ? 'bg-green-500/20 text-green-300' : product.tag === 'Popular' ? 'bg-orange-500/20 text-orange-300' : 'bg-purple-500/20 text-purple-300'}`}>
            {product.tag}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-semibold text-lg">{product.name}</h3>
          <p className="text-sm text-ink-muted mt-1">{product.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-ink-muted">
            <div>Pricing: {product.price}</div>
            <div className="text-xs">Available: {product.available ? 'Yes' : 'No'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <button 
            onClick={() => onView(product)}
            className="btn btn-ghost flex-1"
          >
            View Details
          </button>
          <button 
            onClick={() => onReserve(product)}
            className="btn btn-primary flex-1"
            disabled={!product.available}
          >
            {product.available ? 'Reserve Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  )
}
