// Authentication service for handling user login, logout, and session management

class AuthService {
  constructor() {
    this.user = null
    this.isAuthenticated = false
  }

  // Simulate login
  async login(email, password) {
    // In a real app, this would make an API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          this.user = {
            id: 1,
            name: 'John Doe',
            email: email,
            role: 'admin'
          }
          this.isAuthenticated = true
          localStorage.setItem('user', JSON.stringify(this.user))
          resolve(this.user)
        } else {
          reject(new Error('Invalid credentials'))
        }
      }, 1000)
    })
  }

  // Simulate logout
  async logout() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('user')
        resolve()
      }, 500)
    })
  }

  // Check if user is authenticated
  isLoggedIn() {
    const user = localStorage.getItem('user')
    if (user) {
      this.user = JSON.parse(user)
      this.isAuthenticated = true
      return true
    }
    return false
  }

  // Get current user
  getCurrentUser() {
    return this.user
  }

  // Register new user
  async register(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userData.email && userData.password) {
          this.user = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            role: 'customer'
          }
          this.isAuthenticated = true
          localStorage.setItem('user', JSON.stringify(this.user))
          resolve(this.user)
        } else {
          reject(new Error('Invalid registration data'))
        }
      }, 1000)
    })
  }
}

export default new AuthService()
