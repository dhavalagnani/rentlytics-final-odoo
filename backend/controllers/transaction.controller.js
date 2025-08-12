import Transaction from "../models/Transaction.model.js";
import Order from "../models/Order.model.js";
import { validateRequest } from "../utils/validateRequest.js";

// Get all transactions with pagination
export const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find()
      .populate("orderId", "orderId invoiceNumber totalAmount")
      .populate("userId", "firstName lastName email")
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments();

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Transactions retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get transaction by ID
export const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.Transaction._id;

    const transaction = await Transaction.findById(id)
      .populate(
        "orderId",
        "orderId invoiceNumber totalAmount amountPaid amountDue"
      )
      .populate("userId", "firstName lastName email")
      .lean();

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: transaction,
      message: "Transaction retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Create new transaction
export const createTransaction = async (req, res, next) => {
  try {
    const validation = validateRequest(req.body, [
      "transactionId",
      "orderId",
      "userId",
      "amount",
      "method",
      "transactionRef",
      "stage",
    ]);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const { orderId, amount, method, stage } = req.body;

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const transaction = new Transaction(req.body);
    await transaction.save();

    // Update order payment status
    await updateOrderPaymentStatus(orderId, amount);

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("orderId", "orderId invoiceNumber totalAmount")
      .populate("userId", "name email");

    res.status(201).json({
      success: true,
      data: populatedTransaction,
      message: "Transaction created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Transaction with this transactionId already exists",
      });
    }
    next(error);
  }
};

// Update transaction
export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.Transaction._id;
    const updateData = req.body;

    const transaction = await Transaction.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("orderId", "orderId invoiceNumber totalAmount")
      .populate("userId", "firstName lastName email");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // If amount changed, update order payment status
    if (updateData.amount) {
      await updateOrderPaymentStatus(transaction.orderId, updateData.amount);
    }

    res.json({
      success: true,
      data: transaction,
      message: "Transaction updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete transaction
export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.Transaction._id;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await Transaction.findByIdAndDelete(id);

    // Recalculate order payment status
    await recalculateOrderPaymentStatus(transaction.orderId);

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get transactions by order
export const getTransactionsByOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ orderId })
      .populate("userId", "firstName lastName email")
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ orderId });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Order transactions retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get transactions by user
export const getTransactionsByUser = async (req, res, next) => {
  try {
    const { userId } = req.Transaction._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ userId })
      .populate("orderId", "orderId invoiceNumber totalAmount")
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "User transactions retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get transactions by status
export const getTransactionsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ status })
      .populate("orderId", "orderId invoiceNumber totalAmount")
      .populate("userId", "firstName lastName email")
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ status });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: `${status} transactions retrieved successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update order payment status
const updateOrderPaymentStatus = async (orderId, transactionAmount) => {
  const order = await Order.findById(orderId);
  if (!order) return;

  // Get all successful transactions for this order
  const successfulTransactions = await Transaction.find({
    orderId,
    status: "success",
  });

  const totalPaid = successfulTransactions.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );

  order.amountPaid = totalPaid;
  order.amountDue = order.totalAmount - totalPaid;

  // Update order status
  if (order.amountDue <= 0) {
    order.status = "paid";
  } else if (new Date() > order.dueDate) {
    order.status = "overdue";
  } else if (order.amountPaid > 0) {
    order.status = "partiallyPaid";
  } else {
    order.status = "unpaid";
  }

  await order.save();
};

// Helper function to recalculate order payment status
const recalculateOrderPaymentStatus = async (orderId) => {
  const successfulTransactions = await Transaction.find({
    orderId,
    status: "success",
  });

  const totalPaid = successfulTransactions.reduce(
    (sum, txn) => sum + txn.amount,
    0
  );

  await Order.findByIdAndUpdate(orderId, {
    amountPaid: totalPaid,
    amountDue: { $subtract: ["$totalAmount", totalPaid] },
  });
};

// Get transactions by type
export const getTransactionsByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ type })
      .populate("orderId", "orderId invoiceNumber totalAmount")
      .populate("userId", "firstName lastName email")
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ type });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: `${type} transactions retrieved successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Process payment
export const processPayment = async (req, res, next) => {
  try {
    const validation = validateRequest(req.body, [
      "orderId",
      "amount",
      "method",
      "paymentDetails",
    ]);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const { orderId, amount, method, paymentDetails } = req.body;
    const userId = req.user._id;

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Create transaction
    const transaction = new Transaction({
      transactionId: `TXN${Date.now()}`,
      orderId,
      userId,
      amount,
      method,
      type: "payment",
      status: "completed",
      transactionRef: paymentDetails.reference || `REF${Date.now()}`,
      stage: "completed",
      paymentDetails,
    });

    await transaction.save();
    await updateOrderPaymentStatus(orderId, amount);

    res.json({
      success: true,
      data: transaction,
      message: "Payment processed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Process refund
export const processRefund = async (req, res, next) => {
  try {
    const validation = validateRequest(req.body, [
      "transactionId",
      "amount",
      "reason",
    ]);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const { transactionId, amount, reason } = req.body;
    const userId = req.user._id;

    // Find original transaction
    const originalTransaction = await Transaction.findById(transactionId);
    if (!originalTransaction) {
      return res.status(404).json({
        success: false,
        message: "Original transaction not found",
      });
    }

    // Create refund transaction
    const refundTransaction = new Transaction({
      transactionId: `REF${Date.now()}`,
      orderId: originalTransaction.orderId,
      userId,
      amount: -amount, // Negative amount for refund
      method: originalTransaction.method,
      type: "refund",
      status: "completed",
      transactionRef: `REF${Date.now()}`,
      stage: "completed",
      refundDetails: {
        originalTransactionId: transactionId,
        reason,
        refundAmount: amount,
      },
    });

    await refundTransaction.save();
    await recalculateOrderPaymentStatus(originalTransaction.orderId);

    res.json({
      success: true,
      data: refundTransaction,
      message: "Refund processed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get transaction statistics
export const getTransactionStats = async (req, res, next) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    const completedTransactions = await Transaction.countDocuments({
      status: "completed",
    });
    const pendingTransactions = await Transaction.countDocuments({
      status: "pending",
    });
    const failedTransactions = await Transaction.countDocuments({
      status: "failed",
    });

    // Calculate total revenue
    const revenueResult = await Transaction.aggregate([
      { $match: { status: "completed", amount: { $gt: 0 } } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Calculate revenue growth (simplified - compare with previous month)
    const currentMonth = new Date();
    const previousMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );

    const currentMonthRevenue = await Transaction.aggregate([
      {
        $match: {
          status: "completed",
          amount: { $gt: 0 },
          createdAt: {
            $gte: new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              1
            ),
          },
        },
      },
      { $group: { _id: null, revenue: { $sum: "$amount" } } },
    ]);

    const previousMonthRevenue = await Transaction.aggregate([
      {
        $match: {
          status: "completed",
          amount: { $gt: 0 },
          createdAt: {
            $gte: previousMonth,
            $lt: new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              1
            ),
          },
        },
      },
      { $group: { _id: null, revenue: { $sum: "$amount" } } },
    ]);

    const currentRevenue = currentMonthRevenue[0]?.revenue || 0;
    const previousRevenue = previousMonthRevenue[0]?.revenue || 0;
    const revenueGrowth =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    res.json({
      success: true,
      data: {
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        failedTransactions,
        totalRevenue,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      },
      message: "Transaction statistics retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { period = "month" } = req.query;
    let groupBy, dateFormat;

    switch (period) {
      case "day":
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        dateFormat = "%Y-%m-%d";
        break;
      case "week":
        groupBy = { $dateToString: { format: "%Y-W%U", date: "$createdAt" } };
        dateFormat = "%Y-W%U";
        break;
      case "month":
      default:
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        dateFormat = "%Y-%m";
        break;
    }

    const revenueData = await Transaction.aggregate([
      {
        $match: {
          status: "completed",
          amount: { $gt: 0 },
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }, // Last year
        },
      },
      {
        $group: {
          _id: groupBy,
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedData = revenueData.map((item) => ({
      period: item._id,
      amount: item.amount,
      count: item.count,
    }));

    res.json({
      success: true,
      data: formattedData,
      message: "Revenue analytics retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Export transactions
export const exportTransactions = async (req, res, next) => {
  try {
    const { startDate, endDate, reportType } = req.body;

    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const transactions = await Transaction.find(query)
      .populate("orderId", "orderId invoiceNumber totalAmount")
      .populate("userId", "firstName lastName email")
      .lean();

    // Convert to CSV format
    const csvHeaders = [
      "Transaction ID",
      "Date",
      "Customer",
      "Order ID",
      "Amount",
      "Method",
      "Type",
      "Status",
      "Reference",
    ];

    const csvData = transactions.map((txn) => [
      txn.transactionId,
      new Date(txn.createdAt).toISOString().split("T")[0],
      `${txn.userId?.firstName || ""} ${txn.userId?.lastName || ""}`,
      txn.orderId?.orderId || "",
      txn.amount,
      txn.method,
      txn.type,
      txn.status,
      txn.transactionRef,
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=transactions-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};
