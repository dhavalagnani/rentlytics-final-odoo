import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import productService from '../services/productService'

export default function Navbar({ user, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20
      setIsScrolled(scrolled)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load notifications (temporarily empty)
  useEffect(() => {
    setNotifications([])
  }, [])

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      setIsSearching(true)
      const results = await productService.searchProducts({ query })
      setSearchResults(results)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Error searching products:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchResultClick = (product) => {
    setShowSearchResults(false)
    setSearchQuery('')
    navigate(`/product-details/${product._id}`)
  }

  const handleSearchBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => {
      setShowSearchResults(false)
    }, 200)
  }

  const handleNotificationsToggle = () => {
    setIsNotificationsOpen(!isNotificationsOpen)
  }

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
    setIsUserMenuOpen(false)
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
            <Link to="/dashboard" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Dashboard</Link>
            <Link to="/about" className="text-white/80 hover:text-white transition-colors text-sm font-medium">About</Link>
            <Link to="/contact" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Contact</Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search by name, category, or price..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onBlur={handleSearchBlur}
                className="w-full bg-surface-elev/50 border border-border/60 rounded-lg pl-9 pr-4 py-2 text-white placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-transparent transition-all text-sm"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-elev border border-border/60 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <div className="text-ink-muted text-sm">Searching...</div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      {searchResults.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleSearchResultClick(product)}
                          className="p-3 border-b border-border/40 last:border-b-0 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-medium truncate">{product.name}</div>
                              <div className="text-ink-muted text-xs truncate">{product.categoryId?.name}</div>
                              <div className="text-ink-muted text-xs">
                                ₹{product.baseRates?.daily || 0}/day
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="p-4 text-center">
                      <div className="text-ink-muted text-sm">No products found</div>
                    </div>
                  ) : null}
                </div>
              )}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 00-6 6v3.75l-2.25 2.25V19.5h12.75V15.75L16.5 13.5V9.75a6 6 0 00-6-6z" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-elev border border-border/60 rounded-lg shadow-xl z-50">
                  <div className="p-3 border-b border-border/60">
                    <h3 className="text-white font-semibold text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <div key={index} className="p-3 border-b border-border/40 last:border-b-0 hover:bg-white/5 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                              {notification.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium">{notification.title}</p>
                              <p className="text-ink-muted text-xs mt-1">{notification.message}</p>
                              <p className="text-ink-muted text-xs mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-ink-muted text-sm">No notifications</p>
                      </div>
                    )}
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

                {/* User Dropdown */}
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
                        onClick={handleLogout}
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
                onClick={() => navigate('/login')}
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, category, or price..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onBlur={handleSearchBlur}
                className="w-full bg-surface-elev/50 border border-border/60 rounded-lg pl-9 pr-4 py-2 text-white placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-transparent transition-all text-sm"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              
              {/* Mobile Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-elev border border-border/60 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <div className="text-ink-muted text-sm">Searching...</div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      {searchResults.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleSearchResultClick(product)}
                          className="p-3 border-b border-border/40 last:border-b-0 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-medium truncate">{product.name}</div>
                              <div className="text-ink-muted text-xs truncate">{product.categoryId?.name}</div>
                              <div className="text-ink-muted text-xs">
                                ₹{product.baseRates?.daily || 0}/day
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="p-4 text-center">
                      <div className="text-ink-muted text-sm">No products found</div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
