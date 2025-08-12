import express from "express";
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByOrder,
  getTransactionsByUser,
  getTransactionsByStatus,
  getTransactionsByType,
  processPayment,
  processRefund,
  getTransactionStats,
  getRevenueAnalytics,
  exportTransactions,
} from "../controllers/transaction.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.get("/", authenticateUser, getTransactions);
router.get("/getbyorder", authenticateUser, getTransactionsByOrder);
router.get("/getbyuser", authenticateUser, getTransactionsByUser);
router.get("/getbystatus", authenticateUser, getTransactionsByStatus);
router.get("/getbyid", authenticateUser, getTransactionById);
router.get("/type/:type", authenticateUser, getTransactionsByType);

// Statistics and analytics
router.get("/stats", authenticateUser, getTransactionStats);
router.get("/revenue", authenticateUser, getRevenueAnalytics);

// Payment processing
router.post("/process-payment", authenticateUser, processPayment);
router.post("/process-refund", authenticateUser, processRefund);

// Export functionality
router.post("/export", authenticateUser, exportTransactions);

// User can create and update their own transactions
router.post("/create", authenticateUser, createTransaction);
router.patch("/update", authenticateUser, updateTransaction);
router.delete("/delete", authenticateUser, deleteTransaction);

export default router;
