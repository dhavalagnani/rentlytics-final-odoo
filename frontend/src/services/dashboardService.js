// Dashboard service for handling dashboard operations
import api from './apiService.js';

class DashboardService {
  // Get dashboard data
  async getDashboardData() {
    try {
      const response = await api.get('/user/dashboard');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Get dashboard report as CSV
  async downloadDashboardReport() {
    try {
      const response = await api.get('/user/dashboard/download', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading dashboard report:', error);
      throw error;
    }
  }

  // Get booking report
  async getBookingReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/user/bookings/report?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching booking report:', error);
      throw error;
    }
  }

  // Get transaction report
  async getTransactionReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/user/transactions/report?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching transaction report:', error);
      throw error;
    }
  }

  // Get product analytics
  async getProductAnalytics() {
    try {
      const response = await api.get('/user/analytics/products');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      throw error;
    }
  }
}

export default new DashboardService();
