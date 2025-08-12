import express from "express";
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  getBookingsByUser,
  getBookingsByStage,
  getMyBookings,
  confirmPickup,
  confirmReturn,
  getBookingStats,
  getScheduleBookings,
  getProductAvailability,
  getBookingConflicts,
} from "../controllers/booking.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.get("/", authenticateUser, getBookings);
router.get("/getbyid", authenticateUser, getBookingById);
router.get("/getbyuser", authenticateUser, getBookingsByUser);
router.get("/stage/:stage", authenticateUser, getBookingsByStage);
router.get("/my", authenticateUser, getMyBookings);
router.get("/stats", authenticateUser, getBookingStats);

// User routes
router.post("/create", authenticateUser, createBooking);
router.patch("/update", authenticateUser, updateBooking);
router.patch("/cancel", authenticateUser, cancelBooking);

// Pickup & Return Flow routes
router.post("/:id/pickup/confirm", authenticateUser, confirmPickup);
router.post("/:id/return/confirm", authenticateUser, confirmReturn);

// Schedule routes (integrated with bookings)
router.get("/schedule", authenticateUser, getScheduleBookings);
router.get("/availability", authenticateUser, getProductAvailability);
router.get("/conflicts", authenticateUser, getBookingConflicts);

export default router;
