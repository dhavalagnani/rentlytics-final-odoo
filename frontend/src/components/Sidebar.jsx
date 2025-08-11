import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function Icon({ name, className = 'w-4 h-4' }) {
  const icons = {
    dashboard: <path d="M3 12h8V3H3v9zm0 9h8v-7H3v7zm10 0h8V12h-8v9zm0-18v7h8V3h-8z" />,
    catalog: <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
    orders: <path d="M6 3h12l3 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm0 0v16m12-16v16M9 8h6" stroke="currentColor" strokeWidth="2" fill="none" />,
    schedule: <path d="M7 2v4M17 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" fill="none" />,
    pricing: <path d="M12 1v22M7 5h5a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h7" stroke="currentColor" strokeWidth="2" fill="none" />,
    notifications: <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5L4 18v1h16v-1l-2-2z" />,
    returns: <path d="M4 4v6h6M20 20v-6h-6M20 10a8 8 0 1 0-8 8" stroke="currentColor" strokeWidth="2" fill="none" />,
    reports: <path d="M4 4h16v16H4zM8 14v4M12 10v8M16 6v12" stroke="currentColor" strokeWidth="2" fill="none" />,
    customers: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" fill="none" />,
  }
  return <svg viewBox="0 0 24 24" className={className} aria-hidden>{icons[name]}</svg>
}

function Sidebar() {
  const location = useLocation()
  
  // Routes data
  const routes = [
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

  return (
    <aside className="w-64 bg-surface-elev border-r border-border/60 h-screen sticky top-16 flex-shrink-0">
      <nav className="p-4 space-y-1">
        {routes.map((route) => {
          const isActive = location.pathname === route.path
          return (
            <Link
              key={route.path}
              to={route.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary/15 text-white border border-primary/30' 
                  : 'text-white/80 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon name={route.icon} />
              <span>{route.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
