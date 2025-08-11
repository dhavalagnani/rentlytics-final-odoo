import React, { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'
import AuthModal from './AuthModal'
import layoutService from '../services/layoutService'

function Layout({ children, showSidebar = true }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Initialize layout service
    const handleResize = () => {
      // Trigger re-render on resize for responsive behavior
      window.dispatchEvent(new Event('resize'))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogin = (userData) => {
    layoutService.setUser(userData)
    setUser(userData)
    setIsAuthModalOpen(false)
  }

  const handleAuthModalOpen = () => {
    layoutService.openAuthModal()
    setIsAuthModalOpen(true)
  }

  const handleAuthModalClose = () => {
    layoutService.closeAuthModal()
    setIsAuthModalOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header - starts from top-left corner */}
      <Navbar onLoginClick={handleAuthModalOpen} user={user} />
      
      {/* Main content area */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar - starts immediately under header, flush with left edge */}
        {showSidebar && <Sidebar />}
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Footer - spans full width */}
      <Footer />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={handleAuthModalClose}
        onLogin={handleLogin}
      />
    </div>
  )
}

export default Layout
