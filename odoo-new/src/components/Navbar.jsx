import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import layoutService from '../services/layoutService'

export default function Navbar({ onLoginClick, user }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = layoutService.handleScroll()
      setIsScrolled(scrolled)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const notifications = layoutService.getNotifications()

  const handleSearchToggle = () => {
    const isOpen = layoutService.toggleSearch()
    setIsSearchOpen(isOpen)
  }

  const handleNotificationsToggle = () => {
    const isOpen = layoutService.toggleNotifications()
    setIsNotificationsOpen(isOpen)
  }

  const handleUserMenuToggle = () => {
    const isOpen = layoutService.toggleUserMenu()
    setIsUserMenuOpen(isOpen)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-surface/95 backdrop-blur-md border-b border-border/40 shadow-lg' 
        : 'bg-transparent'
    }`}>
      {/* Container with minimal padding for edge-to-edge design */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - starts from left edge */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-200">
                R
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-bold tracking-tight text-lg group-hover:text-primary transition-colors">
                  Rentlytics
                </div>
                <div className="text-xs text-ink-muted">Smart Rentals</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Home</Link>
            <Link to="/catalog" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Catalog</Link>
            <Link to="/pricing" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Pricing</Link>
            <Link to="/about" className="text-white/80 hover:text-white transition-colors text-sm font-medium">About</Link>
            <Link to="/contact" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Contact</Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-surface-elev/50 border border-border/60 rounded-lg pl-9 pr-4 py-2 text-white placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-transparent transition-all text-sm"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={handleSearchToggle}
              className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={handleNotificationsToggle}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors relative"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v3.75l-1.5 1.5H6l-1.5-1.5V9.75a6 6 0 0 1 6-6z" />
                </svg>
                {layoutService.getUnreadNotificationCount() > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-surface-elev border border-border/60 rounded-lg shadow-xl z-50">
                  <div className="p-3 border-b border-border/60">
                    <h3 className="text-white font-semibold text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {notifications.map(notification => (
                      <div key={notification.id} className="p-3 border-b border-border/30 hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full mt-1.5 ${notification.unread ? 'bg-primary' : 'bg-ink-muted'}`} />
                          <div className="flex-1">
                            <div className="text-white font-medium text-xs">{notification.title}</div>
                            <div className="text-ink-muted text-xs mt-0.5">{notification.message}</div>
                            <div className="text-ink-muted text-xs mt-1">{notification.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border/60">
                    <Link to="/notifications" className="text-primary text-xs hover:underline">View all notifications</Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={handleUserMenuToggle}
                  className="flex items-center space-x-2 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm">{user.name}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-surface-elev border border-border/60 rounded-lg shadow-xl z-50">
                    <div className="p-3 border-b border-border/60">
                      <div className="text-white font-semibold text-sm">{user.name}</div>
                      <div className="text-ink-muted text-xs">{user.email}</div>
                    </div>
                    <div className="p-1">
                      <Link to="/profile" className="block px-2 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors">
                        Profile
                      </Link>
                      <Link to="/settings" className="block px-2 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors">
                        Settings
                      </Link>
                      <button 
                        onClick={() => layoutService.logout()}
                        className="w-full text-left px-2 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <div className="lg:hidden p-3 border-t border-border/60 bg-surface-elev">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-surface-elev/50 border border-border/60 rounded-lg pl-9 pr-4 py-2 text-white placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-transparent transition-all text-sm"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}
    </nav>
  )
}
