import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes, FaBell, FaCheck, FaEye } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { 
  useGetNotificationsQuery, 
  useMarkNotificationAsReadMutation, 
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation
} from '../slices/notificationsApiSlice';

// Create notification context
const NotificationContext = createContext();

// Notification types
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Create unique IDs for notifications
const generateId = () => `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Notification Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add notification
  const addNotification = (type, message, options = {}) => {
    const id = generateId();
    const notification = {
      id,
      type,
      message,
      duration: options.duration || (type === NOTIFICATION_TYPES.ERROR ? 8000 : 5000),
      dismissible: options.dismissible !== undefined ? options.dismissible : true,
      position: options.position || 'top-right',
      onClose: options.onClose || null,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  };

  // Remove notification
  const removeNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && notification.onClose) {
      notification.onClose();
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Helper methods for specific notification types
  const success = (message, options = {}) => 
    addNotification(NOTIFICATION_TYPES.SUCCESS, message, options);
  
  const error = (message, options = {}) => 
    addNotification(NOTIFICATION_TYPES.ERROR, message, options);
  
  const warning = (message, options = {}) => 
    addNotification(NOTIFICATION_TYPES.WARNING, message, options);
  
  const info = (message, options = {}) => 
    addNotification(NOTIFICATION_TYPES.INFO, message, options);

  // Clear all notifications
  const clearAll = () => {
    notifications.forEach(notification => {
      if (notification.onClose) {
        notification.onClose();
      }
    });
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info,
        clearAll
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification Container Component
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  // Auto-remove notifications after duration
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
        
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, removeNotification]);

  const getPositionClasses = (position) => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <FaCheckCircle className="text-green-500" />;
      case NOTIFICATION_TYPES.ERROR:
        return <FaExclamationCircle className="text-red-500" />;
      case NOTIFICATION_TYPES.WARNING:
        return <FaExclamationTriangle className="text-yellow-500" />;
      case NOTIFICATION_TYPES.INFO:
        return <FaInfoCircle className="text-blue-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'bg-green-50 border-green-200 text-green-800';
      case NOTIFICATION_TYPES.ERROR:
        return 'bg-red-50 border-red-200 text-red-800';
      case NOTIFICATION_TYPES.WARNING:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case NOTIFICATION_TYPES.INFO:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed z-50 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed ${getPositionClasses(notification.position)} pointer-events-auto`}
          >
            <div className={`max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 ${getNotificationStyles(notification.type)} p-4 mb-4`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
                {notification.dismissible && (
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Notification Bell Component
export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications = [], isLoading } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId).unwrap();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <FaBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Mark as read"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes
NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Default export - export the NotificationProvider as the main component
export default NotificationProvider;
