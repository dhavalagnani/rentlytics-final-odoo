import {
  sendScheduledReturnReminders,
  sendOverdueReminders,
  sendDailyReturnReminders,
} from "../services/notificationService.js";

/**
 * Notification Scheduler for automated reminder sending
 */
class NotificationScheduler {
  constructor() {
    this.schedules = new Map();
    this.isRunning = false;
  }

  /**
   * Start the notification scheduler
   */
  start() {
    if (this.isRunning) {
      console.log("⚠️ Notification scheduler is already running");
      return;
    }

    this.isRunning = true;
    console.log("🚀 Notification scheduler started");

    // Schedule daily reminders at 9 AM
    this.scheduleDailyReminders();

    // Schedule overdue reminders every 6 hours
    this.scheduleOverdueReminders();

    // Schedule 1-day advance reminders at 10 AM
    this.scheduleAdvanceReminders();

    console.log("✅ All notification schedules configured");
  }

  /**
   * Stop the notification scheduler
   */
  stop() {
    this.isRunning = false;

    // Clear all scheduled tasks
    for (const [name, interval] of this.schedules) {
      clearInterval(interval);
      console.log(`🛑 Stopped schedule: ${name}`);
    }

    this.schedules.clear();
    console.log("🛑 Notification scheduler stopped");
  }

  /**
   * Schedule daily reminders
   */
  scheduleDailyReminders() {
    const scheduleName = "daily-reminders";

    // Calculate time until 9 AM
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(9, 0, 0, 0);

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const timeUntilNextRun = nextRun.getTime() - now.getTime();

    // Schedule first run
    setTimeout(() => {
      this.runDailyReminders();

      // Then schedule to run every 24 hours
      const interval = setInterval(() => {
        this.runDailyReminders();
      }, 24 * 60 * 60 * 1000);

      this.schedules.set(scheduleName, interval);
    }, timeUntilNextRun);

    console.log(`📅 Daily reminders scheduled for ${nextRun.toLocaleString()}`);
  }

  /**
   * Schedule overdue reminders
   */
  scheduleOverdueReminders() {
    const scheduleName = "overdue-reminders";

    // Run immediately, then every 6 hours
    this.runOverdueReminders();

    const interval = setInterval(() => {
      this.runOverdueReminders();
    }, 6 * 60 * 60 * 1000);

    this.schedules.set(scheduleName, interval);
    console.log("📅 Overdue reminders scheduled every 6 hours");
  }

  /**
   * Schedule advance reminders (1 day before)
   */
  scheduleAdvanceReminders() {
    const scheduleName = "advance-reminders";

    // Calculate time until 10 AM
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(10, 0, 0, 0);

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const timeUntilNextRun = nextRun.getTime() - now.getTime();

    // Schedule first run
    setTimeout(() => {
      this.runAdvanceReminders();

      // Then schedule to run every 24 hours
      const interval = setInterval(() => {
        this.runAdvanceReminders();
      }, 24 * 60 * 60 * 1000);

      this.schedules.set(scheduleName, interval);
    }, timeUntilNextRun);

    console.log(
      `📅 Advance reminders scheduled for ${nextRun.toLocaleString()}`
    );
  }

  /**
   * Run daily reminders
   */
  async runDailyReminders() {
    try {
      console.log("🔄 Running daily reminders...");
      const result = await sendDailyReturnReminders();
      console.log(
        `✅ Daily reminders completed: ${result.successCount}/${result.totalBookings} successful`
      );
    } catch (error) {
      console.error("❌ Daily reminders failed:", error.message);
    }
  }

  /**
   * Run overdue reminders
   */
  async runOverdueReminders() {
    try {
      console.log("🔄 Running overdue reminders...");
      const result = await sendOverdueReminders();
      console.log(
        `✅ Overdue reminders completed: ${result.successCount}/${result.totalBookings} successful`
      );
    } catch (error) {
      console.error("❌ Overdue reminders failed:", error.message);
    }
  }

  /**
   * Run advance reminders (1 day before)
   */
  async runAdvanceReminders() {
    try {
      console.log("🔄 Running advance reminders (1 day)...");
      const result = await sendScheduledReturnReminders({ daysThreshold: 1 });
      console.log(
        `✅ Advance reminders completed: ${result.successCount}/${result.totalBookings} successful`
      );
    } catch (error) {
      console.error("❌ Advance reminders failed:", error.message);
    }
  }

  /**
   * Manually trigger a specific reminder type
   */
  async triggerReminder(type, options = {}) {
    try {
      console.log(`🔄 Manually triggering ${type} reminders...`);

      let result;
      switch (type) {
        case "daily":
          result = await sendDailyReturnReminders();
          break;
        case "overdue":
          result = await sendOverdueReminders();
          break;
        case "scheduled":
          result = await sendScheduledReturnReminders({
            daysThreshold: options.daysThreshold || 1,
          });
          break;
        default:
          throw new Error(`Unknown reminder type: ${type}`);
      }

      console.log(
        `✅ ${type} reminders completed: ${result.successCount}/${result.totalBookings} successful`
      );
      return result;
    } catch (error) {
      console.error(`❌ ${type} reminders failed:`, error.message);
      throw error;
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeSchedules: Array.from(this.schedules.keys()),
      totalSchedules: this.schedules.size,
    };
  }
}

// Create singleton instance
const notificationScheduler = new NotificationScheduler();

export default notificationScheduler;
