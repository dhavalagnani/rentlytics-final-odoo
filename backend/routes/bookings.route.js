import express from "express";
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  getBookingsByUser,
} from "../controllers/booking.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.get("/", authenticateUser, getBookings);
router.get("/:id", authenticateUser, getBookingById);
router.get("/user/:userId", authenticateUser, getBookingsByUser);

// User routes
router.post("/", authenticateUser, createBooking);
router.patch("/:id", authenticateUser, updateBooking);
router.patch("/:id/cancel", authenticateUser, cancelBooking);

export default router;
