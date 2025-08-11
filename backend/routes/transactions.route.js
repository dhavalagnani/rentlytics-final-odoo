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
router.get("/getbyorder", authenticateUser, getTransactionsByOrder);
router.get("/getbyuser", authenticateUser, getTransactionsByUser);
router.get("/getbystatus", authenticateUser, getTransactionsByStatus);
router.get("/getbyid", authenticateUser, getTransactionById);

// User can create and update their own transactions
router.post("/create", authenticateUser, createTransaction);
router.patch("/update", authenticateUser, updateTransaction);
router.delete("/delete", authenticateUser, deleteTransaction);

export default router;
