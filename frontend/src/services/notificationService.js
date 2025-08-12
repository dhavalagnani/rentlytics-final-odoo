import apiService from "./apiService.js";

/**
 * Frontend Notification Service
 * Handles all notification-related API calls
 */
class NotificationService {
  /**
   * Send a test notification via multiple channels
   * @param {Object} params
   * @param {string} params.phoneNumber - Recipient phone number
   * @param {string} params.message - Message content
   * @param {string} params.channel - 'whatsapp', 'web_portal', or 'both'
   */
  async sendTestNotification({ phoneNumber, message, channel = "whatsapp" }) {
    try {
      const response = await apiService.post("/notification/test", {
        phoneNumber,
        message,
        channel,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to send test notification"
      );
    }
  }

  /**
   * Send return reminder for a specific booking
   */
  async sendReturnReminder(bookingId) {
    try {
      const response = await apiService.post("/notification/return-reminder", {
        bookingId,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to send return reminder"
      );
    }
  }

  /**
   * Send scheduled reminders for bookings due in X days
   */
  async sendScheduledReminders(daysThreshold = 1) {
    try {
      const response = await apiService.post(
        "/notification/scheduled-reminders",
        {
          daysThreshold,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to send scheduled reminders"
      );
    }
  }

  /**
   * Send overdue reminders
   */
  async sendOverdueReminders() {
    try {
      const response = await apiService.post("/notification/overdue-reminders");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to send overdue reminders"
      );
    }
  }

  /**
   * Send daily reminders
   */
  async sendDailyReminders() {
    try {
      const response = await apiService.post("/notification/daily-reminders");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to send daily reminders"
      );
    }
  }

  /**
   * Get notification service status
   */
  async getNotificationStatus() {
    try {
      const response = await apiService.get("/notification/status");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to get notification status"
      );
    }
  }

  /**
   * Get booking status for notifications
   */
  async getBookingStatus(bookingId) {
    try {
      const response = await apiService.get(
        `/notification/booking-status/${bookingId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to get booking status"
      );
    }
  }

  /**
   * Start notification scheduler
   */
  async startScheduler() {
    try {
      const response = await apiService.post("/notification/scheduler/start");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to start scheduler"
      );
    }
  }

  /**
   * Stop notification scheduler
   */
  async stopScheduler() {
    try {
      const response = await apiService.post("/notification/scheduler/stop");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to stop scheduler"
      );
    }
  }

  /**
   * Get scheduler status
   */
  async getSchedulerStatus() {
    try {
      const response = await apiService.get("/notification/scheduler/status");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to get scheduler status"
      );
    }
  }

  /**
   * Manually trigger reminders
   */
  async triggerReminders(type, options = {}) {
    try {
      const response = await apiService.post(
        "/notification/scheduler/trigger",
        {
          type,
          options,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to trigger reminders"
      );
    }
  }

  /**
   * Get all bookings for notification management
   */
  async getBookingsForNotifications() {
    try {
      const response = await apiService.get("/bookings");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to get bookings"
      );
    }
  }
}

export default new NotificationService();
