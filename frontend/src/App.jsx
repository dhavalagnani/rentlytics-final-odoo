import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Layout Components
import Layout from './components/Layout'

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

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page without sidebar */}
        <Route 
          path="/" 
          element={
            <Layout showSidebar={false}>
              <AnimatedHero />
            </Layout>
          } 
        />
        
        {/* Dashboard pages with sidebar */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/catalog" element={<Layout><Catalog /></Layout>} />
        <Route path="/orders" element={<Layout><Orders /></Layout>} />
        <Route path="/schedule" element={<Layout><Schedule /></Layout>} />
        <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
        <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
        <Route path="/returns" element={<Layout><Returns /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        <Route path="/customer-portal" element={<Layout><CustomerPortal /></Layout>} />
        <Route path="/product-details" element={<Layout><ProductDetails /></Layout>} />
        <Route path="/add-product" element={<Layout><AddProduct /></Layout>} />
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
