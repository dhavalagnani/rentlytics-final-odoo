import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Layout Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Page Components
import Dashboard from './pages/Dashboard'
import Catalog from './pages/Catalog'
import Orders from './pages/Orders'
import Schedule from './pages/Schedule'
import Pricing from './pages/Pricing'
import Notifications from './pages/Notifications'
import Returns from './pages/Returns'
import Reports from './pages/Reports'
import CustomerPortal from './pages/CustomerPortal'
import ProductDetails from './pages/ProductDetails'
import AddProduct from './pages/AddProduct'
import AnimatedHero from './components/AnimatedHero'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - accessible without authentication */}
        <Route 
          path="/" 
          element={
            <Layout showSidebar={false}>
              <AnimatedHero />
            </Layout>
          } 
        />
        
        {/* Login page - accessible without authentication */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/catalog" element={
          <ProtectedRoute>
            <Layout><Catalog /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Layout><Orders /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/schedule" element={
          <ProtectedRoute>
            <Layout><Schedule /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/pricing" element={
          <ProtectedRoute>
            <Layout><Pricing /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Layout><Notifications /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/returns" element={
          <ProtectedRoute>
            <Layout><Returns /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/customer-portal" element={
          <ProtectedRoute>
            <Layout><CustomerPortal /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/product-details/:id" element={
          <ProtectedRoute>
            <Layout><ProductDetails /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/add-product" element={
          <ProtectedRoute>
            <Layout><AddProduct /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
      
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  )
}

export default App
