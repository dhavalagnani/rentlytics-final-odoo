import express from "express";
import {
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByOrder,
  getTransactionsByUser,
  getTransactionsByStatus,
} from "../controllers/transaction.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.get("/", authenticateUser, getTransactionById);
router.get("/order/:orderId", authenticateUser, getTransactionsByOrder);
router.get("/user/:userId", authenticateUser, getTransactionsByUser);
router.get("/status/:status", authenticateUser, getTransactionsByStatus);
router.get("/:id", authenticateUser, getTransactionById);

// User can create and update their own transactions
router.post("/", authenticateUser, createTransaction);
router.patch("/:id", authenticateUser, updateTransaction);

// Admin only routes
router.delete("/:id", authenticateUser, deleteTransaction);

export default router;
