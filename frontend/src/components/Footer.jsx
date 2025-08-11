import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-surface-elev border-t border-border/40 w-full">
      {/* Simple Footer Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-bold text-xs">
                R
              </div>
              <div>
                <div className="text-white font-bold tracking-tight text-sm">Rentlytics</div>
                <div className="text-xs text-ink-muted">Smart Rentals</div>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-white/70 text-xs">
              © {currentYear} Rentlytics. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-4 right-4 w-10 h-10 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-110 z-40 group"
        title="Back to top"
      >
        <svg className="w-4 h-4 mx-auto group-hover:-translate-y-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  )
}
