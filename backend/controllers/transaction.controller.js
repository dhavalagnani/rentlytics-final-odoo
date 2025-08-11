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
      .populate("userId", "name email")
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
    const { id } = req.params;

    const transaction = await Transaction.findById(id)
      .populate(
        "orderId",
        "orderId invoiceNumber totalAmount amountPaid amountDue"
      )
      .populate("userId", "name email")
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
    const { id } = req.params;
    const updateData = req.body;

    const transaction = await Transaction.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("orderId", "orderId invoiceNumber totalAmount")
      .populate("userId", "name email");

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
    const { id } = req.params;

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
      .populate("userId", "name email")
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
    const { userId } = req.params;
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
      .populate("userId", "name email")
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
