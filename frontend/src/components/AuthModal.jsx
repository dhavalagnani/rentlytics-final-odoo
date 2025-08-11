import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { authAPI } from '../services/apiService.js'

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [showOtp, setShowOtp] = useState(false)
  const [otpId, setOtpId] = useState(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    aadharNumber: '',
    agreeToTerms: false
  })
  const [otpData, setOtpData] = useState({
    otp: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (isLogin) {
        // Handle login
        const data = await authAPI.login({
          email: formData.email,
          password: formData.password
        })

        if (data.ok) {
          onLogin({
            name: data.firstName,
            email: formData.email,
            avatar: '👤',
            role: 'Customer'
          })
          toast.success(`Welcome back, ${data.firstName}!`)
        } else {
          toast.error(data.message || 'Login failed')
        }
      } else {
        // Client-side validation for signup
        const phoneDigits = formData.phone.replace(/\D/g, '');
        const aadharDigits = formData.aadharNumber.replace(/\D/g, '');
        
        if (phoneDigits.length !== 10) {
          toast.error('Please enter a valid 10-digit phone number');
          setIsLoading(false);
          return;
        }
        
        if (aadharDigits.length !== 12) {
          toast.error('Please enter a valid 12-digit Aadhar number');
          setIsLoading(false);
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          toast.error('Password and confirm password do not match');
          setIsLoading(false);
          return;
        }
        
        if (!formData.agreeToTerms) {
          toast.error('Please agree to the terms and conditions');
          setIsLoading(false);
          return;
        }

        // Handle signup
        const data = await authAPI.signup({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          aadharNumber: formData.aadharNumber
        })

        if (data.ok) {
          setOtpId(data.otpId)
          setShowOtp(true)
          toast.success('OTP sent to your email. Please check and validate.')
        } else {
          toast.error(data.message || 'Signup failed')
        }
      }
    } catch (error) {
      console.error('API Error:', error)
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Show specific validation errors
          errorData.errors.forEach(err => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(errorData.message || 'Request failed');
        }
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection.')
      } else {
        // Other error
        toast.error('An unexpected error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = await authAPI.validateOtp({
        otpId: otpId,
        otp: otpData.otp
      })

      if (data.ok) {
        onLogin({
          name: data.firstName,
          email: formData.email,
          avatar: '👤',
          role: 'Customer'
        })
        toast.success(`Welcome, ${data.firstName}! Your account has been activated.`)
        setShowOtp(false)
        setOtpId(null)
        setOtpData({ otp: '' })
      } else {
        toast.error(data.message || 'OTP validation failed')
      }
    } catch (error) {
      console.error('OTP API Error:', error)
      if (error.response) {
        toast.error(error.response.data?.message || 'OTP validation failed')
      } else if (error.request) {
        toast.error('Network error. Please check your connection.')
      } else {
        toast.error('An unexpected error occurred.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    let processedValue = value

    // Format phone number as user types
    if (name === 'phone') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Format as +1 (XXX) XXX-XXXX or similar
      if (digitsOnly.length <= 3) {
        processedValue = digitsOnly;
      } else if (digitsOnly.length <= 6) {
        processedValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
      } else {
        processedValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
      }
    }

    // Format aadhar number as user types
    if (name === 'aadharNumber') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Format as XXXX-XXXX-XXXX
      if (digitsOnly.length <= 4) {
        processedValue = digitsOnly;
      } else if (digitsOnly.length <= 8) {
        processedValue = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4)}`;
      } else {
        processedValue = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 8)}-${digitsOnly.slice(8, 12)}`;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }))
  }

  const handleOtpChange = (e) => {
    const { name, value } = e.target
    setOtpData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBackToSignup = () => {
    setShowOtp(false)
    setOtpId(null)
    setOtpData({ otp: '' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-surface-elev border border-border/40 rounded-xl shadow-2xl animate-modalSlideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-extrabold text-xs">
              R
            </div>
            <h2 className="text-white font-bold text-base">
              {showOtp ? 'Verify OTP' : (isLogin ? 'Sign In' : 'Sign Up')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {showOtp ? (
            // OTP Verification Form
            <form onSubmit={handleOtpSubmit} className="space-y-3">
              <div className="text-center mb-4">
                <p className="text-white/80 text-sm">
                  We've sent a 6-digit OTP to your email address.
                </p>
                <p className="text-ink-muted text-xs mt-1">
                  Please check your inbox and enter the code below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/80 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  name="otp"
                  value={otpData.otp}
                  onChange={handleOtpChange}
                  className="w-full bg-surface border border-border/60 rounded-lg px-2 py-1.5 text-white placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary/60 text-xs text-center tracking-widest"
                  placeholder="123456"
                  maxLength="6"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white rounded-lg py-2 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
              >
                {isLoading && (
                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <span>{isLoading ? 'Verifying...' : 'Verify OTP'}</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToSignup}
                  className="text-xs text-primary hover:text-primary/80"
                >
                  ← Back to signup
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Toggle Buttons */}
              <div className="flex bg-surface rounded-lg p-1 mb-4">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                    isLogin 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                    !isLogin 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-surface border border-border/60 rounded-lg px-2 py-1.5 text-white placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary/60 text-xs"
                        placeholder="John"
                        required={!isLogin}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/80 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-surface border border-border/60 rounded-lg px-2 py-1.5 text-white placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary/60 text-xs"
                        placeholder="Doe"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-surface border border-border/60 rounded-lg px-2 py-1.5 text-white placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary/60 text-xs"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-surface border border-border/60 rounded-lg px-2 py-1.5 text-white placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary/60 text-xs"
                      placeholder="(555) 123-4567 (10 digits)"
                      maxLength="14"
                      required={!isLogin}
                    />
                  </div>
                )}

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      className="w-full bg-surface border border-border/60 rounded-lg px-2 py-1.5 text-white placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary/60 text-xs"
                      placeholder="1234-5678-9012"
                      maxLength="14"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-surface border border-border/60 rounded-lg px-2 py-1.5 text-white placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary/60 text-xs"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full bg-surface border border-border/60 rounded-lg px-2 py-1.5 text-white placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-primary/60 text-xs"
                      placeholder="••••••••"
                      required={!isLogin}
                    />
                  </div>
                )}

                {!isLogin && (
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="mt-0.5 w-3 h-3 text-primary bg-surface border-border/60 rounded focus:ring-primary/60"
                      required={!isLogin}
                    />
                    <label className="text-xs text-white/70">
                      I agree to the{' '}
                      <a href="#/terms" className="text-primary hover:text-primary/80">
                        Terms
                      </a>{' '}
                      and{' '}
                      <a href="#/privacy" className="text-primary hover:text-primary/80">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white rounded-lg py-2 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                >
                  {isLoading && (
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  <span>{isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
                </button>
              </form>

              {/* Divider */}
              <div className="my-4 flex items-center">
                <div className="flex-1 border-t border-border/40" />
                <span className="px-3 text-xs text-white/50">or</span>
                <div className="flex-1 border-t border-border/40" />
              </div>

              {/* Social Login */}
              <div className="space-y-2">
                <button className="w-full bg-surface border border-border/60 text-white rounded-lg py-2 font-medium hover:bg-white/5 transition-colors flex items-center justify-center space-x-2 text-xs">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </button>
                
                <button className="w-full bg-surface border border-border/60 text-white rounded-lg py-2 font-medium hover:bg-white/5 transition-colors flex items-center justify-center space-x-2 text-xs">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

              {/* Footer */}
              <div className="mt-4 text-center">
                <p className="text-xs text-white/70">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
                {isLogin && (
                  <button className="mt-2 text-xs text-primary hover:text-primary/80">
                    Forgot password?
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modalSlideIn {
          animation: modalSlideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
