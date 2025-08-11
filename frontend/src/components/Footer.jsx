import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBolt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`mt-24 border-t ${isDark ? 'border-primary-900' : 'border-primary-100'}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-5">
              <FaBolt className={`text-2xl mr-2 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
              <h3 className={`text-xl font-bold tracking-tight ${isDark ? 'text-primary-400 drop-shadow-[0_0_6px_rgba(72,255,128,0.5)]' : 'text-primary-700'}`}>
                EV Management
              </h3>
            </div>
            <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Revolutionizing electric mobility with cutting-edge EV rental solutions, making sustainable transportation accessible to everyone.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4 mt-6">
              <a 
                href="#" 
                className={`text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a 
                href="#" 
                className={`text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>
              <a 
                href="#" 
                className={`text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a 
                href="#" 
                className={`text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a 
                href="#" 
                className={`text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-primary-400' : 'text-primary-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isDark ? 'bg-primary-400' : 'bg-primary-600'}`}></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 inline-flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <span className={`w-1 h-1 rounded-full mr-2 ${isDark ? 'bg-primary-400/70' : 'bg-primary-600/70'}`}></span>
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/stations" 
                  className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 inline-flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <span className={`w-1 h-1 rounded-full mr-2 ${isDark ? 'bg-primary-400/70' : 'bg-primary-600/70'}`}></span>
                  Find Stations
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 inline-flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <span className={`w-1 h-1 rounded-full mr-2 ${isDark ? 'bg-primary-400/70' : 'bg-primary-600/70'}`}></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 inline-flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <span className={`w-1 h-1 rounded-full mr-2 ${isDark ? 'bg-primary-400/70' : 'bg-primary-600/70'}`}></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-primary-400' : 'text-primary-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isDark ? 'bg-primary-400' : 'bg-primary-600'}`}></span>
              Services
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/booking" 
                  className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 inline-flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <span className={`w-1 h-1 rounded-full mr-2 ${isDark ? 'bg-primary-400/70' : 'bg-primary-600/70'}`}></span>
                  Book EV
                </Link>
              </li>
              <li>
                <Link 
                  to="/tracking" 
                  className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 inline-flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <span className={`w-1 h-1 rounded-full mr-2 ${isDark ? 'bg-primary-400/70' : 'bg-primary-600/70'}`}></span>
                  Live Tracking
                </Link>
              </li>
              <li>
                <Link 
                  to="/support" 
                  className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 inline-flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <span className={`w-1 h-1 rounded-full mr-2 ${isDark ? 'bg-primary-400/70' : 'bg-primary-600/70'}`}></span>
                  Support
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className={`hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-300 inline-flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <span className={`w-1 h-1 rounded-full mr-2 ${isDark ? 'bg-primary-400/70' : 'bg-primary-600/70'}`}></span>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-primary-400' : 'text-primary-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isDark ? 'bg-primary-400' : 'bg-primary-600'}`}></span>
              Contact Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaMapMarkerAlt className={`mr-3 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  123 EV Street, Tech City, TC 12345
                </span>
              </div>
              <div className="flex items-center">
                <FaPhone className={`mr-3 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className={`mr-3 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  info@evmanagement.com
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              © {new Date().getFullYear()} EV Management. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                to="/privacy" 
                className={`text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className={`text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                Terms of Service
              </Link>
              <Link 
                to="/cookies" 
                className={`text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
