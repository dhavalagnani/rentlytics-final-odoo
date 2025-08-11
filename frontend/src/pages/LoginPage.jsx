import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/apiService';
import Layout from '../components/Layout';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    aadharNumber: "",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // Check if user is already authenticated
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.ok) {
        // User is already logged in, redirect to intended page
        console.log('User already authenticated, redirecting to:', from);
        navigate(from, { replace: true });
      }
    } catch (error) {
      // User is not authenticated, stay on login page
      console.log('User not authenticated, staying on login page');
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      aadharNumber: "",
      agreeToTerms: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Handle login
        const data = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });

        if (data.ok) {
          toast.success(`Welcome back, ${data.firstName}!`);
          resetForm();
          // Redirect to the page they were trying to access immediately
          // Don't call checkCurrentUser again since login was successful
          navigate(from, { replace: true });
        } else {
          toast.error(data.message || "Login failed");
        }
      } else {
        // Client-side validation for signup
        const phoneDigits = formData.phone.replace(/\D/g, "");
        const aadharDigits = formData.aadharNumber.replace(/\D/g, "");

        if (phoneDigits.length !== 10) {
          toast.error("Please enter a valid 10-digit phone number");
          setIsLoading(false);
          return;
        }

        if (aadharDigits.length !== 12) {
          toast.error("Please enter a valid 12-digit Aadhar number");
          setIsLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("Password and confirm password do not match");
          setIsLoading(false);
          return;
        }

        if (!formData.agreeToTerms) {
          toast.error("Please agree to the terms and conditions");
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
          aadharNumber: formData.aadharNumber,
        });

        if (data.ok) {
          toast.success(
            `Welcome, ${data.firstName}! Your account has been created successfully.`
          );
          resetForm();
          // Redirect to the page they were trying to access
          navigate(from, { replace: true });
        } else {
          toast.error(data.message || "Signup failed");
        }
      }
    } catch (error) {
      console.error("API Error:", error);

      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Show specific validation errors
          errorData.errors.forEach((err) => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(errorData.message || "Request failed");
        }
      } else if (error.request) {
        // Network error
        toast.error("Network error. Please check your connection.");
      } else {
        // Other error
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    // Format phone number as user types
    if (name === "phone") {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, "");
      // Format as (XXX) XXX-XXXX
      if (digitsOnly.length <= 3) {
        processedValue = `(${digitsOnly}`;
      } else if (digitsOnly.length <= 6) {
        processedValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
      } else {
        processedValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(
          3,
          6
        )}-${digitsOnly.slice(6, 10)}`;
      }
    }

    // Format aadhar number as user types
    if (name === "aadharNumber") {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, "");
      // Format as XXXX-XXXX-XXXX
      if (digitsOnly.length <= 4) {
        processedValue = digitsOnly;
      } else if (digitsOnly.length <= 8) {
        processedValue = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4)}`;
      } else {
        processedValue = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(
          4,
          8
        )}-${digitsOnly.slice(8, 12)}`;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));
  };

  return (
    <Layout showSidebar={false} showFooter={false}>
      <div className="h-screen flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-sm bg-surface-elev border border-border/40 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/40">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-white font-bold text-base">
                {isLogin ? "Sign In" : "Sign Up"}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Toggle */}
            <div className="flex bg-surface rounded-lg p-1 mb-4">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                  isLogin
                    ? "bg-primary text-white shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                  !isLogin
                    ? "bg-primary text-white shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input text-xs"
                      required={!isLogin}
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input text-xs"
                      required={!isLogin}
                    />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input text-xs"
                    required={!isLogin}
                  />
                  <input
                    type="text"
                    name="aadharNumber"
                    placeholder="Aadhar Number"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    className="input text-xs"
                    required={!isLogin}
                  />
                </>
              )}

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="input text-xs"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="input text-xs"
                required
              />

              {!isLogin && (
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input text-xs"
                  required={!isLogin}
                />
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
                    I agree to the{" "}
                    <a
                      href="#/terms"
                      className="text-primary hover:text-primary/80"
                    >
                      Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="#/privacy"
                      className="text-primary hover:text-primary/80"
                    >
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
                  <svg
                    className="animate-spin h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                <span>
                  {isLoading
                    ? "Processing..."
                    : isLogin
                    ? "Sign In"
                    : "Create Account"}
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-xs text-white/70">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
              {isLogin && (
                <button className="mt-2 text-xs text-primary hover:text-primary/80">
                  Forgot password?
                </button>
              )}
              <div className="mt-3">
                <button
                  onClick={() => navigate('/')}
                  className="text-xs text-white/60 hover:text-white/80"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LoginPage;
