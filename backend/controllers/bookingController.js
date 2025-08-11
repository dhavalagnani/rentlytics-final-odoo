import asyncHandler from '../middleware/asyncHandler.js';
import Booking from '../models/bookingModel.js';
import EV from '../models/evModel.js';
import Station from '../models/stationModel.js';
import User from '../models/userModel.js';
import { calculateDistance } from '../utils/geoUtils.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const {
    evId,
    startStationId,
    endStationId,
    startTime,
    endTime,
    duration,
    totalCost,
    bookingType = 'immediate'
  } = req.body;

  // Validate required fields
  if (!evId || !startStationId || !endStationId || !startTime || !endTime || !duration || !totalCost) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if EV exists and is available
  const ev = await EV.findById(evId);
  if (!ev) {
    res.status(404);
    throw new Error('EV not found');
  }

  if (ev.status !== 'available') {
    res.status(400);
    throw new Error('This EV is not available for booking');
  }

  // Check if stations exist
  const startStation = await Station.findById(startStationId);
  const endStation = await Station.findById(endStationId);
  
  if (!startStation || !endStation) {
    res.status(404);
    throw new Error('One or both stations not found');
  }

  // Check if user has any active bookings
  const activeBookings = await Booking.find({
    customerId: req.user._id,
    status: { $in: ['pending', 'approved', 'ongoing'] }
  });

  if (activeBookings.length > 0) {
    res.status(400);
    throw new Error('You already have an active booking');
  }

  // Create the booking
  const booking = await Booking.create({
    customerId: req.user._id,
    evId,
    startStationId,
    endStationId,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    duration,
    totalCost,
    bookingType,
    status: 'pending'
  });

  // Update EV status to booked
  ev.status = 'booked';
  await ev.save();

  // Populate the booking with related data
  const populatedBooking = await Booking.findById(booking._id)
    .populate('evId', 'model manufacturer imageUrl registrationNumber pricePerHour')
    .populate('startStationId', 'name address')
    .populate('endStationId', 'name address');

  res.status(201).json(populatedBooking);
});

// @desc    Get all bookings (Admin/Station Master)
// @route   GET /api/bookings
// @access  Private/Admin/StationMaster
const getBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  
  // Station Master can only see bookings from their station
  if (req.user.role === 'stationMaster') {
    const station = await Station.findOne({ stationMasterId: req.user._id });
    if (station) {
      filter.$or = [
        { startStationId: station._id },
        { endStationId: station._id }
      ];
    }
  }

  // Status filter
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Date range filter
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }

  const totalBookings = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('customerId', 'name email phone')
    .populate('evId', 'model manufacturer registrationNumber')
    .populate('startStationId', 'name address')
    .populate('endStationId', 'name address')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    bookings,
    page,
    pages: Math.ceil(totalBookings / limit),
    total: totalBookings
  });
});

// @desc    Get user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate('evId', 'model manufacturer imageUrl registrationNumber pricePerHour')
      .populate('customerId', 'name email')
      .populate('startStationId', 'name address')
      .populate('endStationId', 'name address')
      .sort({ createdAt: -1 });
    
    // Map through bookings to ensure we handle any null references
    const processedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      
      // Handle missing station data
      if (!bookingObj.startStationId) {
        bookingObj.startStationId = { 
          name: "Unknown Station", 
          address: "No address available" 
        };
      }
      
      if (!bookingObj.endStationId) {
        bookingObj.endStationId = { 
          name: "Unknown Station", 
          address: "No address available" 
        };
      }
      
      return bookingObj;
    });
    
    res.json(processedBookings);
  } catch (error) {
    console.error('Error in getMyBookings:', error);
    res.status(500).json({ message: 'Error retrieving bookings data' });
  }
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customerId', 'name email phone')
    .populate('evId', 'model manufacturer batteryLevel range imageUrl pricePerHour registrationNumber')
    .populate('startStationId', 'name address operatingHours')
    .populate('endStationId', 'name address operatingHours');

  if (booking) {
    // Check if the user is authorized to view this booking
    if (
      booking.customerId._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin' ||
      req.user.role === 'stationMaster'
    ) {
      res.json(booking);
    } else {
      res.status(403);
      throw new Error('Not authorized to view this booking');
    }
  } else {
    res.status(404);
    throw new Error('Booking not found');
  }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin/StationMaster/Customer
const updateBookingStatus = asyncHandler(async (req, res) => {
  console.log('Update booking status request body:', req.body);
  console.log('User requesting status update:', req.user.role);
  
  const booking = await Booking.findById(req.params.id)
    .populate('evId', 'status')
    .populate('customerId', 'name email');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Verify user authorization
  if (req.user.role !== 'admin' && req.user.role !== 'stationMaster' &&
      req.user._id.toString() !== booking.customerId._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this booking');
  }

  const { status, actualEndTime, damageReport, damageImages, vehiclePhotosAfterRide } = req.body;

  // Update status
  if (status) {
    booking.status = status;
  }

  // Update actual end time if provided
  if (actualEndTime) {
    booking.actualEndTime = new Date(actualEndTime);
  }

  // Update damage report if provided
  if (damageReport) {
    booking.damageReport = damageReport;
    booking.damageReported = true;
  }

  // Update damage images if provided
  if (damageImages && damageImages.length > 0) {
    booking.damageImages = damageImages;
  }

  // Update vehicle photos after ride if provided
  if (vehiclePhotosAfterRide && vehiclePhotosAfterRide.length > 0) {
    booking.vehiclePhotosAfterRide = vehiclePhotosAfterRide;
  }

  // Update EV status based on booking status
  if (status === 'completed' || status === 'cancelled') {
    const ev = await EV.findById(booking.evId);
    if (ev) {
      ev.status = 'available';
      await ev.save();
    }
  }

  const updatedBooking = await booking.save();
  
  // Populate the updated booking
  const populatedBooking = await Booking.findById(updatedBooking._id)
    .populate('customerId', 'name email phone')
    .populate('evId', 'model manufacturer registrationNumber')
    .populate('startStationId', 'name address')
    .populate('endStationId', 'name address');

  res.json(populatedBooking);
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if user can cancel this booking
  if (booking.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  // Check if booking can be cancelled
  if (booking.status !== 'pending' && booking.status !== 'approved') {
    res.status(400);
    throw new Error('This booking cannot be cancelled');
  }

  // Update booking status
  booking.status = 'cancelled';
  await booking.save();

  // Update EV status back to available
  const ev = await EV.findById(booking.evId);
  if (ev) {
    ev.status = 'available';
    await ev.save();
  }

  res.json({ message: 'Booking cancelled successfully' });
});

// @desc    Get penalty statistics
// @route   GET /api/bookings/penalty-stats
// @access  Private/Admin
const getPenaltyStatistics = asyncHandler(async (req, res) => {
  console.log('Fetching penalty statistics...');
  
  const penaltyBookings = await Booking.find({
    $or: [
      { hasPenalty: true },
      { penalty: { $exists: true } }
    ]
  })
  .populate('customerId', 'name email')
  .populate('evId', 'model manufacturer registrationNumber')
  .select('customerId evId penalty penaltyAmount penaltyReason hasPenalty createdAt updatedAt');

  console.log(`Found ${penaltyBookings.length} bookings with penalties`);
  
  // Handle case of no penalty bookings
  if (penaltyBookings.length === 0) {
    return res.json({
      totalPenaltyCount: 0,
      totalPenaltyAmount: 0,
      customerPenalties: []
    });
  }

  // Calculate summary statistics
  const totalPenaltyAmount = penaltyBookings.reduce((total, booking) => {
    const amount = booking.penalty ? booking.penalty.amount : booking.penaltyAmount || 0;
    return total + amount;
  }, 0);

  // Group penalties by customer
  const customerPenalties = {};
  
  penaltyBookings.forEach(booking => {
    // Skip bookings with missing customer info
    if (!booking.customerId) {
      console.log('Skipping booking with missing customer:', booking._id);
      return;
    }
    
    const customerId = booking.customerId._id.toString();
    const customerName = booking.customerId.name || 'Unknown';
    const customerEmail = booking.customerId.email || 'No email';
    const amount = booking.penalty ? booking.penalty.amount : booking.penaltyAmount || 0;
    
    if (!customerPenalties[customerId]) {
      customerPenalties[customerId] = {
        customerId,
        customerName,
        customerEmail,
        totalAmount: 0,
        count: 0,
        bookings: []
      };
    }
    
    customerPenalties[customerId].totalAmount += amount;
    customerPenalties[customerId].count += 1;
    customerPenalties[customerId].bookings.push({
      bookingId: booking._id,
      amount: amount,
      reason: booking.penalty?.reason || booking.penaltyReason || 'Unknown reason',
      date: booking.penalty?.timestamp || booking.updatedAt,
      vehicle: `${booking.evId?.manufacturer || ''} ${booking.evId?.model || ''} (${booking.evId?.registrationNumber || 'Unknown'})`
    });
  });

  res.json({
    totalPenaltyCount: penaltyBookings.length,
    totalPenaltyAmount,
    customerPenalties: Object.values(customerPenalties)
  });
});

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private/Admin
const getBookingStatistics = asyncHandler(async (req, res) => {
  const totalBookings = await Booking.countDocuments();
  const pendingBookings = await Booking.countDocuments({ status: 'pending' });
  const activeBookings = await Booking.countDocuments({ status: 'ongoing' });
  const completedBookings = await Booking.countDocuments({ status: 'completed' });
  const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

  // Get revenue statistics
  const revenueStats = await Booking.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalCost' },
        averageBookingValue: { $avg: '$totalCost' }
      }
    }
  ]);

  // Get daily booking trends for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyBookings = await Booking.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    totalBookings,
    statusBreakdown: {
      pending: pendingBookings,
      active: activeBookings,
      completed: completedBookings,
      cancelled: cancelledBookings
    },
    revenue: revenueStats.length > 0 ? revenueStats[0] : { totalRevenue: 0, averageBookingValue: 0 },
    dailyBookings
  });
});

// @desc    Update booking location
// @route   PUT /api/bookings/:id/location
// @access  Private
const updateBookingLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    res.status(400);
    throw new Error('Latitude and longitude are required');
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if user can update this booking location
  if (booking.customerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this booking location');
  }

  // Update last known location
  booking.lastKnownLocation = {
    type: 'Point',
    coordinates: [parseFloat(longitude), parseFloat(latitude)],
    timestamp: new Date()
  };

  // Check if within geofence
  if (booking.geofenceData && booking.geofenceData.endLocation) {
    const distance = calculateDistance(
      latitude,
      longitude,
      booking.geofenceData.endLocation.coordinates[1],
      booking.geofenceData.endLocation.coordinates[0]
    );

    booking.geofenceData.wasWithinGeofence = distance <= 0.1; // 100 meters
  }

  await booking.save();
  res.json({ message: 'Location updated successfully' });
});

// @desc    Add penalty to booking
// @route   POST /api/bookings/:id/penalty
// @access  Private/Admin/StationMaster
const addPenalty = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;

  if (!amount || !reason) {
    res.status(400);
    throw new Error('Penalty amount and reason are required');
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if user can add penalty
  if (req.user.role !== 'admin' && req.user.role !== 'stationMaster') {
    res.status(403);
    throw new Error('Not authorized to add penalties');
  }

  // Add penalty
  booking.hasPenalty = true;
  booking.penaltyAmount = (booking.penaltyAmount || 0) + parseFloat(amount);
  booking.penaltyReason = reason;

  await booking.save();

  res.json({ message: 'Penalty added successfully', penaltyAmount: booking.penaltyAmount });
});

// @desc    Add test penalty to booking (for testing purposes)
// @route   POST /api/bookings/:id/test-penalty
// @access  Private/Admin
const addTestPenalty = asyncHandler(async (req, res) => {
  const { penaltyAmount, reason } = req.body;

  if (!penaltyAmount || !reason) {
    res.status(400);
    throw new Error('Penalty amount and reason are required');
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if user can add test penalty (admin only for testing)
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to add test penalties');
  }

  // Add test penalty
  booking.hasPenalty = true;
  booking.penaltyAmount = (booking.penaltyAmount || 0) + parseFloat(penaltyAmount);
  booking.penaltyReason = reason;

  await booking.save();

  res.json({ message: 'Test penalty added successfully', penaltyAmount: booking.penaltyAmount });
});

// @desc    Complete ride
// @route   PUT /api/bookings/:id/complete
// @access  Private
const completeRide = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if user can complete this booking
  if (booking.customerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to complete this booking');
  }

  // Check if booking is in ongoing status
  if (booking.status !== 'ongoing') {
    res.status(400);
    throw new Error('Can only complete ongoing bookings');
  }

  // Update booking status to completed
  booking.status = 'completed';
  booking.completedAt = new Date();

  // Calculate final cost if needed
  if (!booking.totalCost) {
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.completedAt);
    const durationInHours = (endTime - startTime) / (1000 * 60 * 60);
    booking.totalCost = durationInHours * booking.hourlyRate;
  }

  await booking.save();

  res.json({ 
    message: 'Ride completed successfully', 
    booking: {
      id: booking._id,
      status: booking.status,
      totalCost: booking.totalCost,
      completedAt: booking.completedAt
    }
  });
});

// @desc    Report damage to booking
// @route   POST /api/bookings/:id/damage-report
// @access  Private/Admin/StationMaster
const reportDamage = asyncHandler(async (req, res) => {
  const { damageDescription, damageImages, estimatedRepairCost } = req.body;

  if (!damageDescription) {
    res.status(400);
    throw new Error('Damage description is required');
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if user can report damage
  if (req.user.role !== 'admin' && req.user.role !== 'stationMaster') {
    res.status(403);
    throw new Error('Not authorized to report damage');
  }

  // Add damage report
  booking.damageReport = {
    description: damageDescription,
    images: damageImages || [],
    estimatedRepairCost: estimatedRepairCost || 0,
    reportedBy: req.user._id,
    reportedAt: new Date(),
    status: 'pending'
  };

  // Mark booking as having damage
  booking.hasDamage = true;

  await booking.save();

  res.json({ 
    message: 'Damage reported successfully', 
    damageReport: booking.damageReport
  });
});

export {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getPenaltyStatistics,
  getBookingStatistics,
  updateBookingLocation,
  addPenalty,
  addTestPenalty,
  completeRide,
  reportDamage
}; 