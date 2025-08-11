import api from './apiService.js';

class LayoutService {
  // Get navigation menu
  async getNavigationMenu() {
    try {
      // Temporarily return empty array until backend route is created
      return [];
      // const response = await api.get('/navigation');
      // return response.data.menu || [];
    } catch (error) {
      console.error('Error fetching navigation:', error);
      return [];
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Get notifications
  async getNotifications() {
    try {
      // Temporarily return empty array until backend route is created
      return [];
      // const response = await api.get('/notifications');
      // return response.data.notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      // Temporarily return success until backend route is created
      return { ok: true };
      // const response = await api.put(`/notifications/${notificationId}/read`);
      // return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get dashboard stats
  async getDashboardStats() {
    try {
      // Temporarily return empty object until backend route is created
      return {};
      // const response = await api.get('/dashboard/stats');
      // return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {};
    }
  }

  // Get recent activity
  async getRecentActivity() {
    try {
      // Temporarily return empty array until backend route is created
      return [];
      // const response = await api.get('/activity/recent');
      // return response.data.activities || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // Update user preferences
  async updateUserPreferences(preferences) {
    try {
      // Temporarily return success until backend route is created
      return { ok: true };
      // const response = await api.put('/user/preferences', preferences);
      // return response.data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Get user preferences
  async getUserPreferences() {
    try {
      // Temporarily return empty object until backend route is created
      return {};
      // const response = await api.get('/user/preferences');
      // return response.data.preferences || {};
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return {};
    }
  }
}

export default new LayoutService();
