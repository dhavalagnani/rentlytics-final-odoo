import React, { useState, useEffect } from "react";
import NotificationItem from "../components/NotificationItem";
import NotificationModal from "../components/NotificationModal";
import notificationService from "../services/notificationService.js";

function Notifications() {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Enhanced notifications with real data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "reminder",
      title: "Return Reminder",
      message: "Lens EF 70-200mm is due for return in 2 days",
      time: "2 hours ago",
      orderId: "RNT-1042",
      read: false,
    },
    {
      id: 2,
      type: "payment",
      title: "Payment Received",
      message: "Deposit payment received for Order #RNT-1042",
      time: "1 day ago",
      orderId: "RNT-1042",
      read: true,
    },
    {
      id: 3,
      type: "late_fee",
      title: "Late Fee Applied",
      message: "Late fee of ₹200 applied to Order #RNT-0991",
      time: "3 days ago",
      orderId: "RNT-0991",
      read: true,
    },
    {
      id: 4,
      type: "pickup",
      title: "Pickup Scheduled",
      message: "Pickup scheduled for tomorrow at 09:30 AM",
      time: "1 week ago",
      orderId: "RNT-1039",
      read: true,
    },
  ]);

  // Load notification service status on component mount
  useEffect(() => {
    loadNotificationStatus();
    loadSchedulerStatus();
  }, []);

  const loadNotificationStatus = async () => {
    try {
      const response = await notificationService.getNotificationStatus();
      setNotificationStatus(response.data);
    } catch (error) {
      console.error("Failed to load notification status:", error);
    }
  };

  const loadSchedulerStatus = async () => {
    try {
      const response = await notificationService.getSchedulerStatus();
      setSchedulerStatus(response.data);
    } catch (error) {
      console.error("Failed to load scheduler status:", error);
    }
  };

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleDelete = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const handleStartScheduler = async () => {
    try {
      setLoading(true);
      setError("");
      await notificationService.startScheduler();
      setSuccess("Notification scheduler started successfully!");
      loadSchedulerStatus();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStopScheduler = async () => {
    try {
      setLoading(true);
      setError("");
      await notificationService.stopScheduler();
      setSuccess("Notification scheduler stopped successfully!");
      loadSchedulerStatus();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    setShowNotificationModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Notifications</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSendTestNotification}
            className="btn btn-secondary"
          >
            Test Notifications
          </button>
          <button className="btn btn-primary">Configure Settings</button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-white font-semibold text-lg mb-4">
              Recent Notifications
            </h3>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-white font-semibold text-lg mb-4">
            Notification Settings
          </h3>

          {/* Service Status */}
          {notificationStatus && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-medium mb-2">Service Status</h4>
              <div className="space-y-1 text-sm">
                <p className="text-ink-muted">
                  Status:{" "}
                  <span className="text-green-400">
                    {notificationStatus.status}
                  </span>
                </p>
                <p className="text-ink-muted">
                  Channels:{" "}
                  <span className="text-blue-400">
                    {notificationStatus.channels.join(", ")}
                  </span>
                </p>
                <p className="text-ink-muted">
                  Account SID:{" "}
                  <span className="text-ink-muted">
                    {notificationStatus.configuration.accountSid}
                  </span>
                </p>
                <p className="text-ink-muted">
                  Phone Number:{" "}
                  <span className="text-ink-muted">
                    {notificationStatus.configuration.phoneNumber}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Scheduler Status */}
          {schedulerStatus && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <h4 className="text-white font-medium mb-2">Scheduler Status</h4>
              <div className="space-y-1 text-sm">
                <p className="text-ink-muted">
                  Status:
                  <span
                    className={
                      schedulerStatus.isRunning
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {schedulerStatus.isRunning ? " Running" : " Stopped"}
                  </span>
                </p>
                <p className="text-ink-muted">
                  Active Schedules:{" "}
                  <span className="text-blue-400">
                    {schedulerStatus.activeSchedules.length}
                  </span>
                </p>
                {schedulerStatus.activeSchedules.length > 0 && (
                  <div className="text-xs text-ink-muted">
                    {schedulerStatus.activeSchedules.map((schedule) => (
                      <div key={schedule} className="ml-2">
                        • {schedule}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scheduler Controls */}
          <div className="mb-6 space-y-2">
            <button
              onClick={handleStartScheduler}
              disabled={loading || schedulerStatus?.isRunning}
              className="btn btn-success w-full text-sm"
            >
              {loading ? "Starting..." : "Start Scheduler"}
            </button>
            <button
              onClick={handleStopScheduler}
              disabled={loading || !schedulerStatus?.isRunning}
              className="btn btn-danger w-full text-sm"
            >
              {loading ? "Stopping..." : "Stop Scheduler"}
            </button>
          </div>

          {/* Original Settings */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-ink-muted">Lead Time (days)</label>
              <input className="input mt-1" defaultValue={2} type="number" />
            </div>
            <div>
              <label className="text-sm text-ink-muted">Customer Channel</label>
              <select className="input mt-1">
                <option>WhatsApp</option>
                <option>Web Portal</option>
                <option>Both</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-ink-muted">End User Channel</label>
              <select className="input mt-1">
                <option>WhatsApp</option>
                <option>Web Portal</option>
                <option>Both</option>
              </select>
            </div>
            <button className="btn btn-primary w-full">Save Settings</button>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
    </div>
  );
}

export default Notifications;
