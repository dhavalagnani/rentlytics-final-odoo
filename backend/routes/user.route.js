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
import { authenticateToken } from "../middleware/auth.js";

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
router.get("/dashboard", authenticateToken, getDashboard);
router.get("/dashboard/download", authenticateToken, downloadDashboardReport);

// Report routes (requires authentication)
router.get("/bookings/report", authenticateToken, getBookingReport);
router.get(
  "/transactions/report",
  authenticateToken,
  getTransactionReportController
);
router.get(
  "/analytics/products",
  authenticateToken,
  getProductAnalyticsController
);

// Profile management routes (requires authentication)
router.put("/profile", authenticateToken, updateProfile);
router.put(
  "/profile/picture",
  authenticateToken,
  upload.single("profilePicture"),
  updateProfilePicture
);
router.put("/password", authenticateToken, changePassword);

// Statistics route (requires authentication)
router.get("/stats", authenticateToken, getUserStats);

export default router;
