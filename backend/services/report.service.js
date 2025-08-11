import Booking from '../models/Booking.model.js';
import Order from '../models/Order.model.js';
import Transaction from '../models/Transaction.model.js';
import Product from '../models/Product.model.js';

/**
 * Get dashboard data for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Dashboard data
 */
export const getDashboardData = async (userId) => {
  try {
    // Get all bookings for the user
    const bookings = await Booking.find({ userId })
      .populate('productId', 'name category')
      .populate('orderId', 'totalAmount status')
      .sort({ createdAt: -1 });

    // Calculate total bookings
    const totalBookings = bookings.length;

    // Calculate total amount spent
    const totalAmountSpent = bookings.reduce((total, booking) => {
      return total + (booking.totalAmount || 0);
    }, 0);

    // Calculate active rentals (bookings with status 'active' or 'ongoing')
    const totalActiveRentals = bookings.filter(booking => 
      ['active', 'ongoing'].includes(booking.status)
    ).length;

    // Calculate late returns (bookings past end date with status 'active' or 'ongoing')
    const currentDate = new Date();
    const lateReturnsCount = bookings.filter(booking => {
      const endDate = new Date(booking.endDate);
      return endDate < currentDate && ['active', 'ongoing'].includes(booking.status);
    }).length;

    // Get most rented products
    const productRentalCounts = {};
    bookings.forEach(booking => {
      if (booking.productId) {
        const productName = booking.productId.name;
        productRentalCounts[productName] = (productRentalCounts[productName] || 0) + 1;
      }
    });

    const mostRentedProducts = Object.entries(productRentalCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get recent transactions
    const transactions = await Transaction.find({ userId })
      .populate('orderId', 'totalAmount')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent orders
    const orders = await Order.find({ userId })
      .populate('productId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      totalBookings,
      totalAmountSpent,
      totalActiveRentals,
      lateReturnsCount,
      mostRentedProducts,
      recentTransactions: transactions,
      recentOrders: orders,
      recentBookings: bookings.slice(0, 10)
    };
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw new Error('Failed to get dashboard data');
  }
};

/**
 * Get detailed booking report for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Detailed booking data
 */
export const getDetailedBookingReport = async (userId, filters = {}) => {
  try {
    const query = { userId };

    // Apply date filters
    if (filters.startDate) {
      query.createdAt = { $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) };
    }

    // Apply status filter
    if (filters.status) {
      query.status = filters.status;
    }

    const bookings = await Booking.find(query)
      .populate('productId', 'name category price')
      .populate('orderId', 'totalAmount status')
      .sort({ createdAt: -1 });

    return bookings;
  } catch (error) {
    console.error('Error getting detailed booking report:', error);
    throw new Error('Failed to get detailed booking report');
  }
};

/**
 * Get transaction report for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Transaction data
 */
export const getTransactionReport = async (userId, filters = {}) => {
  try {
    const query = { userId };

    // Apply date filters
    if (filters.startDate) {
      query.createdAt = { $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(filters.endDate) };
    }

    // Apply status filter
    if (filters.status) {
      query.status = filters.status;
    }

    const transactions = await Transaction.find(query)
      .populate('orderId', 'totalAmount')
      .sort({ createdAt: -1 });

    return transactions;
  } catch (error) {
    console.error('Error getting transaction report:', error);
    throw new Error('Failed to get transaction report');
  }
};

/**
 * Get product rental analytics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Product analytics
 */
export const getProductAnalytics = async (userId) => {
  try {
    const bookings = await Booking.find({ userId })
      .populate('productId', 'name category price')
      .populate('orderId', 'totalAmount');

    const productStats = {};
    
    bookings.forEach(booking => {
      if (booking.productId) {
        const productId = booking.productId._id.toString();
        const productName = booking.productId.name;
        
        if (!productStats[productId]) {
          productStats[productId] = {
            name: productName,
            totalRentals: 0,
            totalSpent: 0,
            averageRentalDuration: 0,
            lastRented: null
          };
        }

        productStats[productId].totalRentals += 1;
        productStats[productId].totalSpent += booking.totalAmount || 0;
        
        const duration = Math.ceil(
          (new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)
        );
        productStats[productId].averageRentalDuration += duration;
        
        const bookingDate = new Date(booking.createdAt);
        if (!productStats[productId].lastRented || bookingDate > productStats[productId].lastRented) {
          productStats[productId].lastRented = bookingDate;
        }
      }
    });

    // Calculate averages
    Object.values(productStats).forEach(stats => {
      stats.averageRentalDuration = Math.round(stats.averageRentalDuration / stats.totalRentals);
    });

    return Object.values(productStats).sort((a, b) => b.totalRentals - a.totalRentals);
  } catch (error) {
    console.error('Error getting product analytics:', error);
    throw new Error('Failed to get product analytics');
  }
};
