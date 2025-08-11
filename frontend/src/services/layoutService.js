class LayoutService {
  constructor() {
    this.isScrolled = false
    this.isMobileMenuOpen = false
    this.isSearchOpen = false
    this.isNotificationsOpen = false
    this.isUserMenuOpen = false
    this.isAuthModalOpen = false
    this.user = null
  }

  // Scroll handling
  handleScroll() {
    this.isScrolled = window.scrollY > 20
    return this.isScrolled
  }

  // Mobile menu
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen
    return this.isMobileMenuOpen
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false
  }

  // Search functionality
  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen
    return this.isSearchOpen
  }

  closeSearch() {
    this.isSearchOpen = false
  }

  // Notifications
  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen
    return this.isNotificationsOpen
  }

  closeNotifications() {
    this.isNotificationsOpen = false
  }

  // User menu
  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen
    return this.isUserMenuOpen
  }

  closeUserMenu() {
    this.isUserMenuOpen = false
  }

  // Auth modal
  openAuthModal() {
    this.isAuthModalOpen = true
  }

  closeAuthModal() {
    this.isAuthModalOpen = false
  }

  // User management
  setUser(userData) {
    this.user = userData
    this.closeAuthModal()
  }

  getUser() {
    return this.user
  }

  logout() {
    this.user = null
    this.closeUserMenu()
  }

  // Responsive breakpoints
  isMobile() {
    return window.innerWidth < 768
  }

  isTablet() {
    return window.innerWidth >= 768 && window.innerWidth < 1024
  }

  isDesktop() {
    return window.innerWidth >= 1024
  }

  // Layout calculations
  getSidebarWidth() {
    return this.isMobile() ? '100%' : '16rem' // 256px
  }

  getMainContentPadding() {
    if (this.isMobile()) return '1rem'
    if (this.isTablet()) return '1.5rem'
    return '2rem'
  }

  // Theme and styling
  getNavbarBackground() {
    return this.isScrolled 
      ? 'bg-surface/95 backdrop-blur-md border-b border-border/40 shadow-lg'
      : 'bg-transparent'
  }

  // Notification data
  getNotifications() {
    return [
      { id: 1, title: 'Return Reminder', message: 'Camera due in 2 days', time: '2h ago', unread: true },
      { id: 2, title: 'Payment Received', message: 'Deposit confirmed', time: '1d ago', unread: false },
      { id: 3, title: 'New Product', message: 'DJI Drone available', time: '3d ago', unread: false }
    ]
  }

  getUnreadNotificationCount() {
    return this.getNotifications().filter(n => n.unread).length
  }

  // Route management
  getRoutes() {
    return [
      { path: '/dashboard', name: 'Dashboard', icon: 'dashboard' },
      { path: '/catalog', name: 'Catalog', icon: 'catalog' },
      { path: '/orders', name: 'Orders', icon: 'orders' },
      { path: '/schedule', name: 'Schedule', icon: 'schedule' },
      { path: '/pricing', name: 'Pricing', icon: 'pricing' },
      { path: '/notifications', name: 'Notifications', icon: 'notifications' },
      { path: '/returns', name: 'Returns', icon: 'returns' },
      { path: '/reports', name: 'Reports', icon: 'reports' },
      { path: '/customer-portal', name: 'Customer Portal', icon: 'customers' },
    ]
  }

  // Footer data
  getFooterLinks() {
    return {
      product: [
        { name: 'Equipment Catalog', href: '/catalog' },
        { name: 'Pricing Plans', href: '/pricing' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Equipment Categories', href: '/categories' },
        { name: 'New Arrivals', href: '/new-arrivals' }
      ],
      company: [
        { name: 'About Us', href: '/about' },
        { name: 'Our Story', href: '/story' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press & Media', href: '/press' },
        { name: 'Partnerships', href: '/partnerships' }
      ],
      support: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Support', href: '/contact' },
        { name: 'Safety Guidelines', href: '/safety' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' }
      ],
      resources: [
        { name: 'Blog', href: '/blog' },
        { name: 'Equipment Guides', href: '/guides' },
        { name: 'Video Tutorials', href: '/tutorials' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Community Forum', href: '/forum' }
      ]
    }
  }

  getSocialLinks() {
    return [
      { name: 'Facebook', icon: '📘', href: '#' },
      { name: 'Twitter', icon: '🐦', href: '#' },
      { name: 'Instagram', icon: '📷', href: '#' },
      { name: 'LinkedIn', icon: '💼', href: '#' },
      { name: 'YouTube', icon: '📺', href: '#' }
    ]
  }

  getStats() {
    return [
      { value: '10K+', label: 'Happy Customers' },
      { value: '500+', label: 'Equipment Items' },
      { value: '50+', label: 'Cities Served' },
      { value: '99%', label: 'Satisfaction Rate' }
    ]
  }
}

// Create singleton instance
const layoutService = new LayoutService()

export default layoutService
