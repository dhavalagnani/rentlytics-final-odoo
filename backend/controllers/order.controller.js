import Order from "../models/Order.model.js";
import Booking from "../models/Booking.model.js";
import { validateRequest } from "../utils/validateRequest.js";

// Generate unique invoice number
const generateInvoiceNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `INV-${timestamp}-${random}`;
};

// Get all orders with pagination
export const getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate("bookingId", "bookingId startDate endDate")
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments();

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Orders retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.Order._id;

    const order = await Order.findById(id)
      .populate("bookingId", "bookingId startDate endDate pricingSnapshot")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
      message: "Order retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Create new order
export const createOrder = async (req, res, next) => {
  try {
    const validation = validateRequest(req.body, [
      "orderId",
      "bookingId",
      "paymentType",
      "totalAmount",
    ]);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const { bookingId, paymentType, totalAmount } = req.body;

    // Verify booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Calculate amounts based on payment type
    let amountPaid = 0;
    let amountDue = totalAmount;
    let dueDate = new Date();

    if (paymentType === "fullUpfront") {
      amountPaid = totalAmount;
      amountDue = 0;
    } else if (paymentType === "partialUpfront") {
      amountPaid = totalAmount * 0.5; // 50% upfront
      amountDue = totalAmount - amountPaid;
      dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days
    }

    const orderData = {
      ...req.body,
      invoiceNumber: generateInvoiceNumber(),
      amountPaid,
      amountDue,
      dueDate,
      status: amountDue === 0 ? "paid" : "unpaid",
    };

    const order = new Order(orderData);
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate(
      "bookingId",
      "bookingId startDate endDate"
    );

    res.status(201).json({
      success: true,
      data: populatedOrder,
      message: "Order created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Order with this orderId already exists",
      });
    }
    next(error);
  }
};

// Update order
export const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.Order._id;
    const updateData = req.body;

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("bookingId", "bookingId startDate endDate");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
      message: "Order updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update order payment status
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.Order._id;
    const { amountPaid, status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update payment details
    order.amountPaid = amountPaid;
    order.amountDue = order.totalAmount - amountPaid;
    order.status = status;

    // Check if order is fully paid
    if (order.amountDue <= 0) {
      order.status = "paid";
    } else if (new Date() > order.dueDate && order.status !== "paid") {
      order.status = "overdue";
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id).populate(
      "bookingId",
      "bookingId startDate endDate"
    );

    res.json({
      success: true,
      data: populatedOrder,
      message: "Order payment status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete order
export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.Order._id;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get orders by booking
export const getOrdersByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.Order._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ bookingId })
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ bookingId });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Booking orders retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get overdue orders
export const getOverdueOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      status: { $in: ["unpaid", "partiallyPaid"] },
      dueDate: { $lt: new Date() },
    })
      .populate("bookingId", "bookingId startDate endDate")
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({
      status: { $in: ["unpaid", "partiallyPaid"] },
      dueDate: { $lt: new Date() },
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Overdue orders retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};
