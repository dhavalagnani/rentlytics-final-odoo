import express from "express";
import multer from "multer";
import {
  getDashboard,
  downloadDashboardReport,
  getBookingReport,
  getTransactionReportController,
  getProductAnalyticsController,
  updateProfile,
  updateProfilePicture,
  changePassword,
  getUserStats,
} from "../controllers/user.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Dashboard routes (requires authentication)
router.get("/dashboard", authenticateUser, getDashboard);
router.get("/dashboard/download", authenticateUser, downloadDashboardReport);

// Report routes (requires authentication)
router.get("/bookings/report", authenticateUser, getBookingReport);
router.get(
  "/transactions/report",
  authenticateUser,
  getTransactionReportController
);
router.get(
  "/analytics/products",
  authenticateUser,
  getProductAnalyticsController
);

// Profile management routes (requires authentication)
router.put("/profile", authenticateUser, updateProfile);
router.put(
  "/profile/picture",
  authenticateUser,
  upload.single("profilePicture"),
  updateProfilePicture
);
router.put("/password", authenticateUser, changePassword);

// Statistics route (requires authentication)
router.get("/stats", authenticateUser, getUserStats);

export default router;
