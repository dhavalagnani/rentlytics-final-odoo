import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

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
      </Routes>
    </Router>
  )
}

export default App
