import React from 'react'
import { Link } from 'react-router-dom'
import layoutService from '../services/layoutService'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const footerLinks = layoutService.getFooterLinks()
  const socialLinks = layoutService.getSocialLinks()
  const stats = layoutService.getStats()

  return (
    <footer className="bg-surface-elev border-t border-border/40 mt-auto w-full">
      {/* Main Footer Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-bold text-sm">
                  R
                </div>
                <div>
                  <div className="text-white font-bold tracking-tight text-lg">Rentlytics</div>
                  <div className="text-xs text-ink-muted">Smart Rentals</div>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                Your trusted partner for professional equipment rentals. From cameras to construction tools, 
                we provide reliable, high-quality equipment for all your project needs.
              </p>
              
              {/* Newsletter Signup */}
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-2 text-sm">Stay Updated</h4>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-surface border border-border/60 rounded-lg px-3 py-2 text-white placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary/60 text-sm"
                  />
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                    Subscribe
                  </button>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-white font-semibold mb-2 text-sm">Follow Us</h4>
                <div className="flex space-x-2">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-8 h-8 bg-surface border border-border/60 rounded-lg flex items-center justify-center text-sm hover:bg-primary/20 hover:border-primary/40 transition-all duration-200 group"
                      title={social.name}
                    >
                      <span className="group-hover:scale-110 transition-transform duration-200">
                        {social.icon}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-white/70 hover:text-white transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-white/70 hover:text-white transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Support</h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-white/70 hover:text-white transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-8 pt-6 border-t border-border/40">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="group">
                  <div className="text-xl font-bold text-primary group-hover:scale-110 transition-transform duration-200">
                    {stat.value}
                  </div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border/40 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-white/70">
                  © {currentYear} Rentlytics. All rights reserved.
                </span>
                <div className="flex items-center space-x-3">
                  <Link to="/terms" className="text-white/70 hover:text-white transition-colors">
                    Terms
                  </Link>
                  <Link to="/privacy" className="text-white/70 hover:text-white transition-colors">
                    Privacy
                  </Link>
                  <Link to="/cookies" className="text-white/70 hover:text-white transition-colors">
                    Cookies
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white/70 text-sm">
                  <span>🌍</span>
                  <span>English (US)</span>
                </div>
                <div className="flex items-center space-x-2 text-white/70 text-sm">
                  <span>💳</span>
                  <span>Secure Payments</span>
                </div>
              </div>
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
