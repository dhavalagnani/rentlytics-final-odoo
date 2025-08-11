import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
  getUserOrders,
} from "../controllers/payment.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Payment routes
router.post("/create-order", authenticateUser, createRazorpayOrder);
router.post("/verify", authenticateUser, verifyRazorpayPayment);
router.get("/status/:orderId", authenticateUser, getPaymentStatus);
router.get("/orders", authenticateUser, getUserOrders);

export default router;
