import api from "./apiService.js";

// Transaction API methods
export const transactionAPI = {
  // Get all transactions
  getTransactions: async () => {
    try {
      const response = await api.get("/transactions");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching transactions:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get transaction by ID
  getTransactionById: async (transactionId) => {
    try {
      const response = await api.get(
        `/transactions/getbyid?transactionId=${transactionId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching transaction:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get transactions by user
  getTransactionsByUser: async (userId) => {
    try {
      const response = await api.get(
        `/transactions/getbyuser?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching user transactions:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get transactions by type
  getTransactionsByType: async (type) => {
    try {
      const response = await api.get(`/transactions/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching transactions by type:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Create new transaction
  createTransaction: async (transactionData) => {
    try {
      const response = await api.post("/transactions/create", transactionData);
      return response.data;
    } catch (error) {
      console.error(
        "Error creating transaction:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Update transaction
  updateTransaction: async (transactionData) => {
    try {
      const response = await api.patch("/transactions/update", transactionData);
      return response.data;
    } catch (error) {
      console.error(
        "Error updating transaction:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Process payment
  processPayment: async (paymentData) => {
    try {
      const response = await api.post(
        "/transactions/process-payment",
        paymentData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error processing payment:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Process refund
  processRefund: async (refundData) => {
    try {
      const response = await api.post(
        "/transactions/process-refund",
        refundData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error processing refund:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get transaction statistics
  getTransactionStats: async () => {
    try {
      const response = await api.get("/transactions/stats");
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching transaction stats:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get revenue analytics
  getRevenueAnalytics: async (period = "month") => {
    try {
      const response = await api.get(`/transactions/revenue?period=${period}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching revenue analytics:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Export transactions
  exportTransactions: async (filters = {}) => {
    try {
      const response = await api.post("/transactions/export", filters, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error exporting transactions:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default transactionAPI;
