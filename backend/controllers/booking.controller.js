import Booking from "../models/Booking.model.js";
import Product from "../models/Product.model.js";
import Pricelist from "../models/Pricelist.model.js";
import PriceRule from "../models/PriceRule.model.js";
import { validateRequest } from "../utils/validateRequest.js";
import { applyPriceRules } from "../utils/pricingEngine.js";

// Get all bookings with pagination
export const getBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find()
      .populate("userId", "firstName lastName email")
      .populate("productId", "name images")
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments();

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Bookings retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.Booking._id;

    const booking = await Booking.findById(id)
      .populate("userId", "firstName lastName email")
      .populate("productId", "name images baseRates")
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
      message: "Booking retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Create new booking
export const createBooking = async (req, res, next) => {
  try {
    const validation = validateRequest(req.body, [
      "bookingId",
      "userId",
      "productId",
      "startDate",
      "endDate",
      "unitCount",
    ]);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const { productId, startDate, endDate, unitCount } = req.body;

    // Check product availability
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Product is not available for booking",
      });
    }

    // Check if enough units are available
    if (unitCount > product.unitsAvailable) {
      return res.status(400).json({
        success: false,
        message: "Not enough units available",
      });
    }

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      productId,
      status: { $in: ["pending", "confirmed", "pickedup"] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    const totalBookedUnits = overlappingBookings.reduce(
      (sum, booking) => sum + booking.unitCount,
      0
    );
    if (totalBookedUnits + unitCount > product.unitsAvailable) {
      return res.status(400).json({
        success: false,
        message: "Not enough units available for the selected dates",
      });
    }

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));
    const durationDays = Math.ceil(durationHours / 24);

    // Get applicable pricelist and rules
    const user = await User.findById(req.body.userId);
    const pricelist = await Pricelist.findOne({
      targetCustomerTypes: user.customerType,
      "validity.startDate": { $lte: new Date() },
      "validity.endDate": { $gte: new Date() },
    });

    const priceRules = await PriceRule.find({
      $or: [{ productId }, { categoryId: product.categoryId }],
      enabled: true,
      "validity.startDate": { $lte: new Date() },
      "validity.endDate": { $gte: new Date() },
    }).sort({ priority: 1 });

    // Calculate pricing
    const baseRates = pricelist ? pricelist.baseRates : product.baseRates;
    const pricingSnapshot = await applyPriceRules(baseRates, priceRules, {
      durationHours,
      durationDays,
      unitCount,
      userType: user.customerType,
    });

    const bookingData = {
      ...req.body,
      durationHours,
      durationDays,
      pricingSnapshot,
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Update product units
    await Product.findByIdAndUpdate(productId, {
      $inc: { unitsAvailable: -unitCount },
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("userId", "name email")
      .populate("productId", "name images");

    res.status(201).json({
      success: true,
      data: populatedBooking,
      message: "Booking created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Booking with this bookingId already exists",
      });
    }
    next(error);
  }
};

// Update booking
export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.Booking._id;
    const updateData = req.body;

    const booking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("userId", "firstName lastName email")
      .populate("productId", "name images");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: booking,
      message: "Booking updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.Booking._id;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking can be cancelled
    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Booking cannot be cancelled in current status",
      });
    }

    if (new Date(booking.startDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel booking that has already started",
      });
    }

    // Update booking status
    booking.status = "cancelled";
    await booking.save();

    // Restore product units
    await Product.findByIdAndUpdate(booking.productId, {
      $inc: { unitsAvailable: booking.unitCount },
    });

    res.json({
      success: true,
      data: booking,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get bookings by user
export const getBookingsByUser = async (req, res, next) => {
  try {
    const { userId } = req.Booking._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ userId })
      .populate("productId", "name images")
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "User bookings retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};
