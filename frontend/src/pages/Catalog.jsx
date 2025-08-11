import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import productService from '../services/productService'

function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.trim()) {
      try {
        const results = await productService.searchProducts(query)
        setProducts(results)
      } catch (error) {
        console.error('Error searching products:', error)
      }
    } else {
      loadProducts()
    }
  }

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category)
    if (category) {
      try {
        const results = await productService.getProductsByCategory(category)
        setProducts(results)
      } catch (error) {
        console.error('Error filtering by category:', error)
      }
    } else {
      loadProducts()
    }
  }

  const handleViewProduct = (product) => {
    navigate(`/product-details/${product.id}`)
  }

  const handleReserveProduct = async (product) => {
    try {
      const isAvailable = await productService.checkAvailability(product.id)
      if (isAvailable) {
        alert(`Reserving ${product.name}`)
        // In a real app, this would navigate to a reservation form
      } else {
        alert(`${product.name} is not available for the selected dates`)
      }
    } catch (error) {
      console.error('Error checking availability:', error)
    }
  }

  const categories = ['Camera', 'Projector', 'Heavy Equipment', 'Drone', 'Audio', 'Lighting']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Catalog</h2>
        <div className="flex gap-2">
          <input 
            className="input w-64" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <select 
            className="input w-32"
            value={selectedCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/add-product')}
          >
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-auto-fill gap-4">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product}
            onView={handleViewProduct}
            onReserve={handleReserveProduct}
          />
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-white/60">No products found</div>
        </div>
      )}
    </div>
  )
}

export default Catalog
