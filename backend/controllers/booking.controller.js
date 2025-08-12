// services/bookingService.js
import Booking from "../models/Booking.model.js";
import Product from "../models/Product.model.js";
import Pricelist from "../models/Pricelist.model.js";
import PriceRule from "../models/PriceRule.model.js";
import User from "../models/User.model.js";
import { applyPriceRules } from "../utils/pricingEngine.js";
import StockService from "./stockService.js";
import NotificationService from "./notificationService.js";
import DocumentService from "./documentService.js";
import BookingService from "../services/bookingService.js";
import { createBookingSchema } from "../validators/bookingValidators.js";

export const createBooking = async (req, res, next) => {
  try {
    // 1. Validate input
    const { error, value } = createBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    // 2. Create booking
    const booking = await BookingService.createBooking({
      ...value,
      userId: req.user._id,
    });

    // 3. Return
    return res.status(201).json({
      success: true,
      data: booking,
      message: "Booking created successfully",
    });
  } catch (err) {
    next(err);
  }
};

export default {
  async createBooking(data) {
    const {
      productId,
      startDate,
      endDate,
      unitCount,
      pickupAddress,
      dropAddress,
      notes,
      bookingId,
    } = data;

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
    if (product.status !== "active")
      throw new Error("Product is not available");

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
      throw new Error("Not enough units available for the selected dates");
    }

    // Pricing
    const user = await User.findById(data.userId);
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

    const durationHours = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60)
    );
    const durationDays = Math.ceil(durationHours / 24);
    const baseRates = pricelist ? pricelist.baseRates : product.baseRates;

    const pricingSnapshot = await applyPriceRules(baseRates, priceRules, {
      durationHours,
      durationDays,
      unitCount,
      userType: user.customerType,
    });

    // Save booking
    const booking = await Booking.create({
      bookingId: bookingId || `BK${Date.now()}`,
      userId: data.userId,
      productId,
      startDate,
      endDate,
      unitCount,
      pickupAddress,
      dropAddress,
      notes,
      durationHours,
      durationDays,
      pricingSnapshot,
      status: "reserved",
    });

    // Update stock
    await Product.findByIdAndUpdate(productId, {
      $inc: { unitsAvailable: -unitCount },
    });

    // Notify
    await NotificationService.sendBookingConfirmation(booking);

    return booking;
  },
};
