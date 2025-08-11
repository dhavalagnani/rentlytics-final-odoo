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
router.get("/getbyid", authenticateUser, getOrderById);
router.get("/getbybooking", authenticateUser, getOrdersByBooking);
router.get("/overdue/list", authenticateUser, getOverdueOrders);

// User routes
router.post("/create", authenticateUser, createOrder);
router.patch("/order", authenticateUser, updateOrder);
router.patch("/update/payment", authenticateUser, updatePaymentStatus);

// Admin only routes
router.delete("/delete", authenticateUser, deleteOrder);

export default router;
