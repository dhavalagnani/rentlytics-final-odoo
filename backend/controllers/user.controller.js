import User from '../models/User.model.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getDashboardData, getDetailedBookingReport, getTransactionReport, getProductAnalytics } from '../services/report.service.js';
import { generateDashboardCSV, generateBookingsCSV, generateTransactionsCSV, setCSVHeaders } from '../utils/reportGenerator.js';
import { uploadImageFromBuffer, deleteImage } from '../utils/cloudinary.js';

/**
 * Get user dashboard data
 * GET /api/user/dashboard
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const dashboardData = await getDashboardData(userId.toString());
  
  // Add user info to dashboard data
  const userInfo = {
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email
  };

  res.json({
    ok: true,
    message: 'Dashboard data retrieved successfully',
    data: {
      ...dashboardData,
      userInfo
    }
  });
});

/**
 * Download dashboard report as CSV
 * GET /api/user/dashboard/download
 */
export const downloadDashboardReport = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const dashboardData = await getDashboardData(userId.toString());
  
  // Add user info
  const userInfo = {
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email
  };

  const csvContent = generateDashboardCSV({
    ...dashboardData,
    userInfo
  });

  setCSVHeaders(res, `dashboard-report-${userId}-${new Date().toISOString().split('T')[0]}`);
  res.send(csvContent);
});

/**
 * Get detailed booking report
 * GET /api/user/bookings/report
 */
export const getBookingReport = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate, status, download } = req.query;

  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  if (status) filters.status = status;

  const bookings = await getDetailedBookingReport(userId.toString(), filters);

  if (download === 'true') {
    const csvContent = generateBookingsCSV(bookings);
    setCSVHeaders(res, `bookings-report-${userId}-${new Date().toISOString().split('T')[0]}`);
    return res.send(csvContent);
  }

  res.json({
    ok: true,
    message: 'Booking report retrieved successfully',
    data: bookings
  });
});

/**
 * Get transaction report
 * GET /api/user/transactions/report
 */
export const getTransactionReportController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate, status, download } = req.query;

  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;
  if (status) filters.status = status;

  const transactions = await getTransactionReport(userId.toString(), filters);

  if (download === 'true') {
    const csvContent = generateTransactionsCSV(transactions);
    setCSVHeaders(res, `transactions-report-${userId}-${new Date().toISOString().split('T')[0]}`);
    return res.send(csvContent);
  }

  res.json({
    ok: true,
    message: 'Transaction report retrieved successfully',
    data: transactions
  });
});

/**
 * Get product analytics
 * GET /api/user/analytics/products
 */
export const getProductAnalyticsController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const productAnalytics = await getProductAnalytics(userId.toString());

  res.json({
    ok: true,
    message: 'Product analytics retrieved successfully',
    data: productAnalytics
  });
});

/**
 * Update user profile
 * PUT /api/user/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { firstName, lastName, phone, aadharNumber } = req.body;

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      ok: false,
      message: 'User not found'
    });
  }

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone.replace(/\D/g, '');
  if (aadharNumber) user.aadharNumber = aadharNumber.replace(/\D/g, '');

  await user.save();

  res.json({
    ok: true,
    message: 'Profile updated successfully',
    data: user.toPublicJSON()
  });
});

/**
 * Update user profile picture
 * PUT /api/user/profile/picture
 */
export const updateProfilePicture = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      message: 'Profile picture is required'
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      ok: false,
      message: 'User not found'
    });
  }

  try {
    // Upload new image to Cloudinary
    const uploadResult = await uploadImageFromBuffer(
      req.file.buffer,
      'profile-pictures'
    );

    // Delete old profile picture if exists
    if (user.profilePicture?.public_id) {
      try {
        await deleteImage(user.profilePicture.public_id);
      } catch (error) {
        console.error('Error deleting old profile picture:', error);
      }
    }

    // Update user profile picture
    user.profilePicture = {
      public_id: uploadResult.public_id,
      url: uploadResult.url
    };

    await user.save();

    res.json({
      ok: true,
      message: 'Profile picture updated successfully',
      data: {
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to update profile picture'
    });
  }
});

/**
 * Change user password
 * PUT /api/user/password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      ok: false,
      message: 'Current password and new password are required'
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      ok: false,
      message: 'User not found'
    });
  }

  // Verify current password
  if (!user.comparePassword(currentPassword)) {
    return res.status(400).json({
      ok: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    ok: true,
    message: 'Password changed successfully'
  });
});

/**
 * Get user statistics
 * GET /api/user/stats
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const dashboardData = await getDashboardData(userId.toString());
  
  const stats = {
    totalBookings: dashboardData.totalBookings,
    totalAmountSpent: dashboardData.totalAmountSpent,
    totalActiveRentals: dashboardData.totalActiveRentals,
    lateReturnsCount: dashboardData.lateReturnsCount,
    averageBookingValue: dashboardData.totalBookings > 0 
      ? dashboardData.totalAmountSpent / dashboardData.totalBookings 
      : 0,
    mostRentedProduct: dashboardData.mostRentedProducts[0] || null
  };

  res.json({
    ok: true,
    message: 'User statistics retrieved successfully',
    data: stats
  });
});
