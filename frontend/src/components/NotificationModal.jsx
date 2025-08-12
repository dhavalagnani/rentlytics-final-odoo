import React, { useState, useEffect } from "react";
import notificationService from "../services/notificationService.js";

const NotificationModal = ({ isOpen, onClose, bookingId = null }) => {
  const [activeTab, setActiveTab] = useState("test");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Test notification form (WhatsApp only)
  const [testForm, setTestForm] = useState({
    phoneNumber: "",
    message: "",
    channel: "whatsapp",
  });

  // Scheduled reminders form
  const [scheduledForm, setScheduledForm] = useState({
    daysThreshold: 1,
  });

  // Booking status
  const [bookingStatus, setBookingStatus] = useState(null);

  // Load booking status if bookingId is provided
  useEffect(() => {
    if (bookingId && isOpen) {
      loadBookingStatus();
    }
  }, [bookingId, isOpen]);

  const loadBookingStatus = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getBookingStatus(bookingId);
      setBookingStatus(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await notificationService.sendTestNotification(testForm);
      setSuccess(
        `${testForm.channel.toUpperCase()} notification sent successfully!`
      );
      setMessage(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnReminder = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await notificationService.sendReturnReminder(bookingId);
      setSuccess("Return reminder sent successfully!");
      setMessage(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduledReminders = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await notificationService.sendScheduledReminders(
        scheduledForm.daysThreshold
      );
      setSuccess(
        `Scheduled reminders sent for bookings due in ${scheduledForm.daysThreshold} day(s)!`
      );
      setMessage(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOverdueReminders = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await notificationService.sendOverdueReminders();
      setSuccess("Overdue reminders sent successfully!");
      setMessage(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyReminders = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await notificationService.sendDailyReminders();
      setSuccess("Daily reminders sent successfully!");
      setMessage(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Notification Management
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab("test")}
            className={`px-4 py-2 ${
              activeTab === "test"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Test Notifications
          </button>
          <button
            onClick={() => setActiveTab("reminders")}
            className={`px-4 py-2 ${
              activeTab === "reminders"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Send Reminders
          </button>
          {bookingId && (
            <button
              onClick={() => setActiveTab("booking")}
              className={`px-4 py-2 ${
                activeTab === "booking"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              Booking Status
            </button>
          )}
        </div>

        {/* Test Notifications Tab */}
        {activeTab === "test" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Send Test Notification
            </h3>
            <form onSubmit={handleTestNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={testForm.phoneNumber}
                  onChange={(e) =>
                    setTestForm({ ...testForm, phoneNumber: e.target.value })
                  }
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={testForm.message}
                  onChange={(e) =>
                    setTestForm({ ...testForm, message: e.target.value })
                  }
                  placeholder="Enter your test message..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel
                </label>
                <select
                  value={testForm.channel}
                  onChange={(e) =>
                    setTestForm({ ...testForm, channel: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="web_portal">Web Portal</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Test Notification"}
              </button>
            </form>
          </div>
        )}

        {/* Send Reminders Tab */}
        {activeTab === "reminders" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Send Scheduled Reminders
              </h3>
              <form onSubmit={handleScheduledReminders} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Days Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scheduledForm.daysThreshold}
                    onChange={(e) =>
                      setScheduledForm({
                        ...scheduledForm,
                        daysThreshold: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Send reminders for bookings due in X days
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Scheduled Reminders"}
                </button>
              </form>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleOverdueReminders}
                  disabled={loading}
                  className="bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Overdue Reminders"}
                </button>
                <button
                  onClick={handleDailyReminders}
                  disabled={loading}
                  className="bg-purple-500 text-white py-3 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Daily Reminders"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Status Tab */}
        {activeTab === "booking" && bookingId && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
            {loading ? (
              <div className="text-center py-4">Loading booking status...</div>
            ) : bookingStatus ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold text-gray-800">
                      Booking Details
                    </h4>
                    <p>
                      <strong>Product:</strong> {bookingStatus.productName}
                    </p>
                    <p>
                      <strong>User:</strong> {bookingStatus.userName}
                    </p>
                    <p>
                      <strong>Phone:</strong> {bookingStatus.userPhone}
                    </p>
                    <p>
                      <strong>Status:</strong> {bookingStatus.status}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold text-gray-800">
                      Return Information
                    </h4>
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {new Date(bookingStatus.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>End Date:</strong>{" "}
                      {new Date(bookingStatus.endDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Days Remaining:</strong>{" "}
                      {bookingStatus.daysRemaining}
                    </p>
                    <p>
                      <strong>Status:</strong> {bookingStatus.statusMessage}
                    </p>
                  </div>
                </div>

                {bookingStatus.shouldSendReminder && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                    <p className="text-yellow-800">
                      <strong>⚠️ Reminder Recommended:</strong> This booking is
                      due soon or overdue.
                    </p>
                    <button
                      onClick={handleReturnReminder}
                      disabled={loading}
                      className="mt-2 bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Send Return Reminder"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No booking status available
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {message && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Response Details:</h4>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
              {message}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
