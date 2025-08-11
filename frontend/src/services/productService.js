// Product service for handling product operations

class ProductService {
  constructor() {
    this.products = [
      {
        id: 1,
        name: '4K Cinema Camera',
        description: 'Professional 4K cinema camera with advanced features',
        price: '₹10/hr',
        tag: 'New',
        available: true,
        category: 'Camera',
        specifications: {
          resolution: '4K',
          sensor: 'Full Frame',
          weight: '2.5kg'
        }
      },
      {
        id: 2,
        name: 'Projector Pro X',
        description: 'High-quality projector for events and presentations',
        price: '₹60/day',
        tag: 'Popular',
        available: true,
        category: 'Projector',
        specifications: {
          brightness: '5000 lumens',
          resolution: '1920x1080',
          weight: '3.2kg'
        }
      },
      {
        id: 3,
        name: 'Excavator ZX',
        description: 'Heavy-duty excavator for construction projects',
        price: '₹300/week',
        tag: 'Premium',
        available: false,
        category: 'Heavy Equipment',
        specifications: {
          capacity: '20 tons',
          engine: 'Diesel',
          weight: '15 tons'
        }
      },
      {
        id: 4,
        name: 'DJI Drone',
        description: 'Professional drone for aerial photography',
        price: '₹10/hr',
        tag: 'New',
        available: true,
        category: 'Drone',
        specifications: {
          range: '7km',
          battery: '30 minutes',
          camera: '4K'
        }
      },
      {
        id: 5,
        name: 'Audio Kit',
        description: 'Complete audio setup for events',
        price: '₹60/day',
        tag: 'Popular',
        available: true,
        category: 'Audio',
        specifications: {
          power: '2000W',
          channels: '8',
          weight: '25kg'
        }
      },
      {
        id: 6,
        name: 'Lighting Rig',
        description: 'Professional lighting setup',
        price: '₹60/day',
        tag: 'Premium',
        available: true,
        category: 'Lighting',
        specifications: {
          brightness: '10000 lumens',
          colorTemp: '3200K-5600K',
          weight: '8kg'
        }
      }
    ]
  }

  // Get all products
  async getAllProducts() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.products)
      }, 500)
    })
  }

  // Get product by ID
  async getProductById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = this.products.find(p => p.id === id)
        if (product) {
          resolve(product)
        } else {
          reject(new Error('Product not found'))
        }
      }, 300)
    })
  }

  // Search products
  async searchProducts(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = this.products.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        )
        resolve(filtered)
      }, 300)
    })
  }

  // Get products by category
  async getProductsByCategory(category) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = this.products.filter(product =>
          product.category.toLowerCase() === category.toLowerCase()
        )
        resolve(filtered)
      }, 300)
    })
  }

  // Add new product
  async addProduct(productData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduct = {
          id: Date.now(),
          ...productData,
          available: true
        }
        this.products.push(newProduct)
        resolve(newProduct)
      }, 500)
    })
  }

  // Update product
  async updateProduct(id, productData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...productData }
          resolve(this.products[index])
        } else {
          reject(new Error('Product not found'))
        }
      }, 500)
    })
  }

  // Delete product
  async deleteProduct(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) {
          this.products.splice(index, 1)
          resolve(true)
        } else {
          reject(new Error('Product not found'))
        }
      }, 500)
    })
  }

  // Check product availability
  async checkAvailability(id, startDate, endDate) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = this.products.find(p => p.id === id)
        if (product && product.available) {
          // In a real app, this would check against existing bookings
          resolve(true)
        } else {
          resolve(false)
        }
      }, 200)
    })
  }
}

export default new ProductService()
