import axios from 'axios'

// Create axios instance with default configuration
const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url, error.response?.data)
    return Promise.reject(error)
  }
)

// Auth API methods
export const authAPI = {
  // Signup user
  signup: async (userData) => {
    console.log('=== FRONTEND SIGNUP DATA ===');
    console.log('Sending signup data:', JSON.stringify(userData, null, 2));
    console.log('================================');
    
    const response = await api.post('/api/auth/signup', userData)
    return response.data
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials)
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me')
    return response.data
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/api/auth/logout')
    return response.data
  }
}

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health')
  return response.data
}

export default api
