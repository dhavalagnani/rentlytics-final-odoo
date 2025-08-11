import express from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updatePaymentStatus,
  deleteOrder,
  getOrdersByBooking,
  getOverdueOrders,
} from "../controllers/order.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.get("/", authenticateUser, getOrders);
router.get("/:id", authenticateUser, getOrderById);
router.get("/booking/:bookingId", authenticateUser, getOrdersByBooking);
router.get("/overdue/list", authenticateUser, getOverdueOrders);

// User routes
router.post("/", authenticateUser, createOrder);
router.patch("/:id", authenticateUser, updateOrder);
router.patch("/:id/payment", authenticateUser, updatePaymentStatus);

// Admin only routes
router.delete("/:id", authenticateUser, deleteOrder);

export default router;
