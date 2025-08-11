import { asyncHandler } from "../middleware/errorHandler.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.model.js";
import Booking from "../models/Booking.model.js";
import User from "../models/User.model.js";
import Product from "../models/Product.model.js";

// Initialize Razorpay with proper error handling
const initializeRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.");
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// Create Razorpay order for rental
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  try {
    console.log('🚀 Creating Razorpay order...', req.body);
    
    const { 
      productId, 
      startDate, 
      endDate, 
      unitCount = 1,
      rentalType = 'daily',
      rentalDuration = 1,
      totalAmount,
      rentalAmount,
      depositAmount
    } = req.body;
    
    const userId = req.user._id;

    // Validate required fields
    if (!productId || !totalAmount || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Product ID, total amount, start date, and end date are required",
      });
    }

    // Validate amount
    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Total amount must be greater than 0",
      });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));
    const durationDays = Math.ceil(durationHours / 24);

    // Create booking
    const bookingData = {
      bookingId: `BOOK_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      userId,
      productId,
      unitCount,
      startDate: start,
      endDate: end,
      durationHours,
      durationDays,
      rentalType,
      rentalDuration,
      status: 'pending',
      paymentStatus: 'pending',
      pricingSnapshot: {
        baseRates: product.baseRates || { hourly: 0, daily: 0, weekly: 0 },
        appliedPricelistId: null,
        appliedRules: [],
        discountAmount: 0,
        lateFee: 0,
        rentalAmount: rentalAmount || 0,
        deposit: depositAmount || 0,
        totalPrice: totalAmount
      }
    };

    const newBooking = new Booking(bookingData);
    await newBooking.save();
    console.log('✅ Booking created:', newBooking._id);

    // Create order
    const orderData = {
      orderId: `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      bookingId: newBooking._id,
      invoiceNumber: `INV_${Date.now()}`,
      paymentType: "fullUpfront",
      totalAmount: totalAmount,
      amountPaid: 0,
      amountDue: totalAmount,
      dueDate: new Date(),
      currency: "INR",
      status: "unpaid"
    };

    const newOrder = new Order(orderData);
    await newOrder.save();
    console.log('✅ Order created:', newOrder._id);

    // Initialize Razorpay
    const razorpayInstance = initializeRazorpay();

    // Create Razorpay order
    const options = {
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: "INR",
      receipt: newOrder._id.toString(),
      notes: {
        bookingId: newBooking._id.toString(),
        productId: productId,
        userId: userId.toString()
      }
    };

    console.log('🎯 Creating Razorpay order with options:', options);
    
    const razorpayOrder = await razorpayInstance.orders.create(options);
    console.log('✅ Razorpay order created:', razorpayOrder.id);

    res.json({ 
      success: true, 
      order: razorpayOrder,
      bookingId: newBooking._id,
      orderId: newOrder._id
    });

  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    
    // Handle specific Razorpay errors
    if (error.error) {
      return res.status(400).json({
        success: false,
        message: error.error.description || "Payment gateway error",
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create payment order" 
    });
  }
});

// Verify Razorpay payment with signature
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;
    
    const userId = req.user._id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data is incomplete",
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Initialize Razorpay
    const razorpayInstance = initializeRazorpay();

    // Fetch order details from Razorpay
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    
    if (orderInfo.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    // Update order status
    const order = await Order.findById(orderInfo.receipt);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order and booking
    await Order.findByIdAndUpdate(order._id, { 
      status: "paid",
      amountPaid: order.totalAmount,
      amountDue: 0
    });

    await Booking.findByIdAndUpdate(order.bookingId, { 
      paymentStatus: "paid",
      status: "confirmed"
    });

    // Clear user cart if exists
    await User.findByIdAndUpdate(userId, { cartData: {} });

    console.log('✅ Payment verified successfully');

    res.json({ 
      success: true, 
      message: "Payment verified successfully",
      orderId: order._id,
      paymentId: razorpay_payment_id
    });

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Payment verification failed" 
    });
  }
});

// Get payment status
export const getPaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    
    const order = await Order.findById(orderId)
      .populate({
        path: 'bookingId',
        populate: {
          path: 'productId',
          select: 'name images'
        }
      });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify user owns this order
    const booking = await Booking.findById(order.bookingId);
    if (!booking || booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      order: {
        _id: order._id,
        orderId: order.orderId,
        status: order.status,
        totalAmount: order.totalAmount,
        amountPaid: order.amountPaid,
        amountDue: order.amountDue,
        currency: order.currency,
        createdAt: order.createdAt,
        booking: order.bookingId
      }
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all user orders
export const getUserOrders = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    
    const orders = await Order.find()
      .populate({
        path: 'bookingId',
        match: { userId: userId },
        populate: {
          path: 'productId',
          select: 'name images'
        }
      })
      .sort({ createdAt: -1 });

    // Filter out orders that don't belong to the user
    const userOrders = orders.filter(order => order.bookingId);

    res.json({
      success: true,
      orders: userOrders
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
