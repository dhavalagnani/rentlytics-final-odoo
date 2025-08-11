import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import productService from '../services/productService'

function Catalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      // Try to get products excluding user's own products (authenticated)
      let data = await productService.getAllProducts()
      
      // If that fails (user not authenticated), fall back to public products
      if (data.length === 0) {
        try {
          data = await productService.getAllProductsPublic()
        } catch (publicError) {
          console.error('Error loading public products:', publicError)
        }
      }
      
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
      // Fallback to public products if authenticated route fails
      try {
        const publicData = await productService.getAllProductsPublic()
        setProducts(publicData)
      } catch (publicError) {
        console.error('Error loading public products:', publicError)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data.categories);
      } else {
        console.error('Failed to fetch categories:', data.message);
        // Fallback to default categories
        setCategories([
          { _id: '1', name: 'Electronics' },
          { _id: '2', name: 'Tools & Equipment' },
          { _id: '3', name: 'Vehicles' },
          { _id: '4', name: 'Furniture' },
          { _id: '5', name: 'Sports Equipment' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories
      setCategories([
        { _id: '1', name: 'Electronics' },
        { _id: '2', name: 'Tools & Equipment' },
        { _id: '3', name: 'Vehicles' },
        { _id: '4', name: 'Furniture' },
        { _id: '5', name: 'Sports Equipment' }
      ]);
    }
  }



  const handleCategoryFilter = async (categoryId) => {
    setSelectedCategory(categoryId)
    if (categoryId) {
      try {
        setLoading(true)
        const results = await productService.getProductsByCategory(categoryId)
        setProducts(results)
      } catch (error) {
        console.error('Error filtering by category:', error)
        // Fallback to loading all products
        loadProducts()
      } finally {
        setLoading(false)
      }
    } else {
      loadProducts()
    }
  }

  const handleViewProduct = (product) => {
    navigate(`/product-details/${product._id}`)
  }

  const handleRentProduct = async (product) => {
    // Navigate to product details page for rental
    navigate(`/product-details/${product._id}`)
  }

  const [categories, setCategories] = useState([])

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
           <select 
             className="input w-32"
             value={selectedCategory}
             onChange={(e) => handleCategoryFilter(e.target.value)}
           >
             <option value="">All Categories</option>
             {categories.map(category => (
               <option key={category._id} value={category._id}>{category.name}</option>
             ))}
           </select>
           {selectedCategory && (
             <button 
               className="btn btn-ghost"
               onClick={() => {
                 setSelectedCategory('')
                 loadProducts()
               }}
             >
               Clear Filters
             </button>
           )}
           <button 
             className="btn btn-primary"
             onClick={() => navigate('/add-product')}
           >
             Add Product
           </button>
         </div>
       </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard 
            key={product._id} 
            product={product}
            onView={handleViewProduct}
            onRent={handleRentProduct}
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
