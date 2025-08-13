// services/bookingService.js
import Booking from "../models/Booking.model.js";
import Product from "../models/Product.model.js";
import Pricelist from "../models/Pricelist.model.js";
import PriceRule from "../models/PriceRule.model.js";
import User from "../models/User.model.js";
import { applyPriceRules } from "../utils/pricingEngine.js";
import StockService from "../services/stockService.js";
import NotificationService from "../services/notificationService.js";
import DocumentService from "../services/documentService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Get all bookings
export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate("userId", "firstName lastName email")
    .populate("productId", "name description images")
    .sort({ createdAt: -1 });

  res.json({
    ok: true,
    data: bookings,
    message: "Bookings retrieved successfully",
  });
});

// Get booking by ID
export const getBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.query;

  if (!bookingId) {
    return res.status(400).json({
      ok: false,
      message: "Booking ID is required",
    });
  }

  const booking = await Booking.findById(bookingId)
    .populate("userId", "firstName lastName email")
    .populate("productId", "name description images");

  if (!booking) {
    return res.status(404).json({
      ok: false,
      message: "Booking not found",
    });
  }

  res.json({
    ok: true,
    data: booking,
    message: "Booking retrieved successfully",
  });
});

// Get bookings by user
export const getBookingsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      ok: false,
      message: "User ID is required",
    });
  }

  const bookings = await Booking.find({ userId })
    .populate("productId", "name description images")
    .sort({ createdAt: -1 });

  res.json({
    ok: true,
    data: bookings,
    message: "User bookings retrieved successfully",
  });
});

// Get bookings by stage
export const getBookingsByStage = asyncHandler(async (req, res) => {
  const { stage } = req.params;

  const bookings = await Booking.find({ status: stage })
    .populate("userId", "firstName lastName email")
    .populate("productId", "name description images")
    .sort({ createdAt: -1 });

  res.json({
    ok: true,
    data: bookings,
    message: `Bookings with stage ${stage} retrieved successfully`,
  });
});

// Get my bookings (current user)
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate("productId", "name description images")
    .sort({ createdAt: -1 });

  res.json({
    ok: true,
    data: bookings,
    message: "My bookings retrieved successfully",
  });
});

// Create new booking
export const createBooking = asyncHandler(async (req, res) => {
  const {
    productId,
    startDate,
    endDate,
    unitCount,
    pickupAddress,
    dropAddress,
    notes,
  } = req.body;

  // Validate required fields
  if (!productId || !startDate || !endDate || !unitCount) {
    return res.status(400).json({
      ok: false,
      message: "Product ID, start date, end date, and unit count are required",
    });
  }

  // Fetch product
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      ok: false,
      message: "Product not found",
    });
  }

  if (product.status !== "active") {
    return res.status(400).json({
      ok: false,
      message: "Product is not available",
    });
  }

  // Availability check
  const overlappingBookings = await Booking.find({
    productId,
    status: { $in: ["pending", "confirmed", "picked_up"] },
    $or: [
      {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) },
      },
    ],
  });

  const totalBookedUnits = overlappingBookings.reduce(
    (sum, b) => sum + b.unitCount,
    0
  );

  if (totalBookedUnits + unitCount > product.unitsAvailable) {
    return res.status(400).json({
      ok: false,
      message: "Not enough units available for the selected dates",
    });
  }

  // Calculate duration
  const durationHours = Math.ceil(
    (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60)
  );
  const durationDays = Math.ceil(durationHours / 24);

  // Create booking
  const booking = await Booking.create({
    bookingId: `BK${Date.now()}`,
    userId: req.user._id,
    productId,
    startDate,
    endDate,
    unitCount,
    pickupAddress,
    dropAddress,
    notes,
    durationHours,
    durationDays,
    status: "pending",
  });

  // Update product units available
  await Product.findByIdAndUpdate(productId, {
    $inc: { unitsAvailable: -unitCount },
  });

  // Populate the booking for response
  const populatedBooking = await Booking.findById(booking._id)
    .populate("userId", "firstName lastName email")
    .populate("productId", "name description images");

  res.status(201).json({
    ok: true,
    data: populatedBooking,
    message: "Booking created successfully",
  });
});

// Update booking
export const updateBooking = asyncHandler(async (req, res) => {
  const { bookingId, ...updateData } = req.body;

  if (!bookingId) {
    return res.status(400).json({
      ok: false,
      message: "Booking ID is required",
    });
  }

  const booking = await Booking.findByIdAndUpdate(bookingId, updateData, {
    new: true,
  })
    .populate("userId", "firstName lastName email")
    .populate("productId", "name description images");

  if (!booking) {
    return res.status(404).json({
      ok: false,
      message: "Booking not found",
    });
  }

  res.json({
    ok: true,
    data: booking,
    message: "Booking updated successfully",
  });
});

// Cancel booking
export const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId, reason } = req.body;

  if (!bookingId) {
    return res.status(400).json({
      ok: false,
      message: "Booking ID is required",
    });
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({
      ok: false,
      message: "Booking not found",
    });
  }

  // Update booking status
  booking.status = "cancelled";
  if (reason) booking.cancellationReason = reason;
  await booking.save();

  // Restore product units
  await Product.findByIdAndUpdate(booking.productId, {
    $inc: { unitsAvailable: booking.unitCount },
  });

  const populatedBooking = await Booking.findById(bookingId)
    .populate("userId", "firstName lastName email")
    .populate("productId", "name description images");

  res.json({
    ok: true,
    data: populatedBooking,
    message: "Booking cancelled successfully",
  });
});

// Confirm pickup
export const confirmPickup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pickupNotes } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    return res.status(404).json({
      ok: false,
      message: "Booking not found",
    });
  }

  booking.status = "picked_up";
  booking.pickupNotes = pickupNotes;
  booking.pickupDate = new Date();
  await booking.save();

  const populatedBooking = await Booking.findById(id)
    .populate("userId", "firstName lastName email")
    .populate("productId", "name description images");

  res.json({
    ok: true,
    data: populatedBooking,
    message: "Pickup confirmed successfully",
  });
});

// Confirm return
export const confirmReturn = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { returnNotes } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    return res.status(404).json({
      ok: false,
      message: "Booking not found",
    });
  }

  booking.status = "returned";
  booking.returnNotes = returnNotes;
  booking.returnDate = new Date();
  await booking.save();

  // Restore product units
  await Product.findByIdAndUpdate(booking.productId, {
    $inc: { unitsAvailable: booking.unitCount },
  });

  const populatedBooking = await Booking.findById(id)
    .populate("userId", "firstName lastName email")
    .populate("productId", "name description images");

  res.json({
    ok: true,
    data: populatedBooking,
    message: "Return confirmed successfully",
  });
});

// Get booking statistics
export const getBookingStats = asyncHandler(async (req, res) => {
  const stats = await Booking.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalBookings = await Booking.countDocuments();

  res.json({
    ok: true,
    data: {
      stats,
      total: totalBookings,
    },
    message: "Booking statistics retrieved successfully",
  });
});

// Get bookings for calendar view (day, week, month) - Schedule functionality
export const getScheduleBookings = asyncHandler(async (req, res) => {
  const { view, date, startDate, endDate } = req.query;

  let query = {};

  if (view === "day" && date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    query = {
      $or: [
        {
          startDate: { $gte: startOfDay, $lte: endOfDay },
        },
        {
          endDate: { $gte: startOfDay, $lte: endOfDay },
        },
        {
          startDate: { $lte: startOfDay },
          endDate: { $gte: endOfDay },
        },
      ],
    };
  } else if (view === "week" && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    query = {
      $or: [
        {
          startDate: { $gte: start, $lte: end },
        },
        {
          endDate: { $gte: start, $lte: end },
        },
        {
          startDate: { $lte: start },
          endDate: { $gte: end },
        },
      ],
    };
  } else if (view === "month" && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    query = {
      $or: [
        {
          startDate: { $gte: start, $lte: end },
        },
        {
          endDate: { $gte: start, $lte: end },
        },
        {
          startDate: { $lte: start },
          endDate: { $gte: end },
        },
      ],
    };
  }

  const bookings = await Booking.find(query)
    .populate("userId", "firstName lastName email")
    .populate("productId", "name description images")
    .sort({ startDate: 1 });

  res.json({
    ok: true,
    data: bookings,
    message: "Schedule bookings retrieved successfully",
  });
});

// Get product availability for specific dates
export const getProductAvailability = asyncHandler(async (req, res) => {
  const { productId, startDate, endDate } = req.query;

  if (!productId || !startDate || !endDate) {
    return res.status(400).json({
      ok: false,
      message: "Product ID, start date, and end date are required",
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      ok: false,
      message: "Product not found",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Get overlapping bookings
  const overlappingBookings = await Booking.find({
    productId,
    status: { $in: ["pending", "confirmed", "picked_up"] },
    $or: [
      {
        startDate: { $lte: end },
        endDate: { $gte: start },
      },
    ],
  });

  const totalBookedUnits = overlappingBookings.reduce(
    (sum, booking) => sum + booking.unitCount,
    0
  );

  const availableUnits = product.unitsAvailable - totalBookedUnits;

  res.json({
    ok: true,
    data: {
      productId,
      totalUnits: product.unitsAvailable,
      bookedUnits: totalBookedUnits,
      availableUnits: Math.max(0, availableUnits),
      isAvailable: availableUnits > 0,
      overlappingBookings: overlappingBookings.length,
    },
    message: "Product availability retrieved successfully",
  });
});

// Get booking conflicts
export const getBookingConflicts = asyncHandler(async (req, res) => {
  const { productId, startDate, endDate, excludeBookingId } = req.query;

  if (!productId || !startDate || !endDate) {
    return res.status(400).json({
      ok: false,
      message: "Product ID, start date, and end date are required",
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  let query = {
    productId,
    status: { $in: ["pending", "confirmed", "picked_up"] },
    $or: [
      {
        startDate: { $lte: end },
        endDate: { $gte: start },
      },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflicts = await Booking.find(query)
    .populate("userId", "firstName lastName email")
    .populate("productId", "name")
    .sort({ startDate: 1 });

  res.json({
    ok: true,
    data: conflicts,
    message: "Booking conflicts retrieved successfully",
  });
});
