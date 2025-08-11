// Order service for handling rental orders

class OrderService {
  constructor() {
    this.orders = [
      {
        id: 'RNT-1042',
        customer: 'Acme Films',
        customerEmail: 'contact@acmefilms.com',
        item: 'Camera Kit A',
        quantity: 1,
        period: '12–14 Mar',
        duration: 3,
        status: 'Confirmed',
        amount: '₹24,500',
        deposit: '₹4,900',
        createdAt: '2024-03-10',
        pickupDate: '2024-03-12',
        returnDate: '2024-03-14'
      },
      {
        id: 'RNT-1039',
        customer: 'BuildRight LLC',
        customerEmail: 'info@buildright.com',
        item: 'Excavator ZX',
        quantity: 1,
        period: '10–20 Mar',
        duration: 11,
        status: 'Pickup',
        amount: '₹2,10,000',
        deposit: '₹42,000',
        createdAt: '2024-03-08',
        pickupDate: '2024-03-10',
        returnDate: '2024-03-20'
      },
      {
        id: 'RNT-0991',
        customer: 'City Events',
        customerEmail: 'events@cityevents.com',
        item: 'Projector 4K',
        quantity: 2,
        period: '9–10 Mar',
        duration: 2,
        status: 'Late',
        amount: '₹12,000',
        deposit: '₹2,400',
        createdAt: '2024-03-07',
        pickupDate: '2024-03-09',
        returnDate: '2024-03-10'
      }
    ]
  }

  // Get all orders
  async getAllOrders() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.orders)
      }, 500)
    })
  }

  // Get order by ID
  async getOrderById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = this.orders.find(o => o.id === id)
        if (order) {
          resolve(order)
        } else {
          reject(new Error('Order not found'))
        }
      }, 300)
    })
  }

  // Create new order
  async createOrder(orderData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrder = {
          id: `RNT-${Date.now()}`,
          ...orderData,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'Pending'
        }
        this.orders.push(newOrder)
        resolve(newOrder)
      }, 500)
    })
  }

  // Update order status
  async updateOrderStatus(id, status) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = this.orders.find(o => o.id === id)
        if (order) {
          order.status = status
          resolve(order)
        } else {
          reject(new Error('Order not found'))
        }
      }, 300)
    })
  }

  // Get orders by status
  async getOrdersByStatus(status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = this.orders.filter(order => order.status === status)
        resolve(filtered)
      }, 300)
    })
  }

  // Get orders by customer
  async getOrdersByCustomer(customerEmail) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = this.orders.filter(order => order.customerEmail === customerEmail)
        resolve(filtered)
      }, 300)
    })
  }

  // Calculate late fees
  async calculateLateFees(orderId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = this.orders.find(o => o.id === orderId)
        if (order && order.status === 'Late') {
          const daysLate = Math.max(0, Math.floor((new Date() - new Date(order.returnDate)) / (1000 * 60 * 60 * 24)))
          const lateFee = daysLate * 200 // ₹200 per day
          resolve(lateFee)
        } else {
          resolve(0)
        }
      }, 200)
    })
  }

  // Process payment
  async processPayment(orderId, amount, paymentType) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = this.orders.find(o => o.id === orderId)
        if (order) {
          // In a real app, this would integrate with a payment gateway
          resolve({
            success: true,
            transactionId: `TXN-${Date.now()}`,
            amount: amount,
            paymentType: paymentType
          })
        } else {
          reject(new Error('Order not found'))
        }
      }, 1000)
    })
  }

  // Generate invoice
  async generateInvoice(orderId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = this.orders.find(o => o.id === orderId)
        if (order) {
          const invoice = {
            invoiceId: `INV-${orderId}`,
            order: order,
            items: [
              {
                description: order.item,
                quantity: order.quantity,
                rate: order.amount,
                amount: order.amount
              }
            ],
            subtotal: order.amount,
            deposit: order.deposit,
            total: order.amount,
            generatedAt: new Date().toISOString()
          }
          resolve(invoice)
        } else {
          reject(new Error('Order not found'))
        }
      }, 500)
    })
  }

  // Get order statistics
  async getOrderStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats = {
          total: this.orders.length,
          confirmed: this.orders.filter(o => o.status === 'Confirmed').length,
          pickup: this.orders.filter(o => o.status === 'Pickup').length,
          late: this.orders.filter(o => o.status === 'Late').length,
          totalRevenue: this.orders.reduce((sum, o) => sum + parseInt(o.amount.replace(/[^\d]/g, '')), 0)
        }
        resolve(stats)
      }, 300)
    })
  }
}

export default new OrderService()
