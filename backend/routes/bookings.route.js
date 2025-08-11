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
router.get("/getbyid", authenticateUser, getBookingById);
router.get("/getbyuser", authenticateUser, getBookingsByUser);

// User routes
router.post("/create", authenticateUser, createBooking);
router.patch("/update", authenticateUser, updateBooking);
router.patch("/cancel", authenticateUser, cancelBooking);

export default router;
