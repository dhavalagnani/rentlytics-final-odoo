import axios from "axios";

// API base URL configuration
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: "/api", // Use relative path since Vite proxy handles the full URL
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", config.method?.toUpperCase(), config.url);
    console.log("Request headers:", config.headers);
    console.log("With credentials:", config.withCredentials);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    console.log("Response headers:", response.headers);
    console.log("Set-Cookie header:", response.headers["set-cookie"]);
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error("API Response Error:", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
      code: error.code,
    });

    // CORS error detection
    if (
      error.code === "ERR_NETWORK" ||
      error.message.includes("Network Error")
    ) {
      console.error("🚨 CORS/Network Error detected!");
      console.error("This might be a CORS issue. Please check:");
      console.error("1. Backend server is running on", API_BASE);
      console.error("2. CORS is properly configured on the backend");
      console.error("3. Frontend is making requests to the correct URL");
      console.error("4. No firewall/network issues blocking the connection");
    }

    // Timeout error detection
    if (error.code === "ECONNABORTED") {
      console.error("⏰ Request timeout - server took too long to respond");
    }

    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  // Signup user
  signup: async (userData) => {
    console.log("=== FRONTEND SIGNUP DATA ===");
    console.log("Sending signup data:", JSON.stringify(userData, null, 2));
    console.log("================================");

    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log("Login attempt with:", { email: credentials.email });
      const response = await api.post("/auth/login", credentials);
      console.log("Login response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/me");
      console.log("getCurrentUser response:", response.data);
      return response.data;
    } catch (error) {
      console.error("getCurrentUser error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  const response = await api.get("/health");
  return response.data;
};

// Test database connection
export const testDatabase = async () => {
  const response = await api.get("/test-db");
  return response.data;
};

export default api;
