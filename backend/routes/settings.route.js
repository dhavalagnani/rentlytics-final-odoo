import express from "express";
import {
  getSettings,
  getPenaltySettings,
  updatePenaltySettings,
  updateNotificationSettings,
  resetSettings,
  getSettingsStats,
} from "../controllers/settings.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Protected routes - only admin should access these
router.get("/", authenticateUser, getSettings);
router.get("/stats", authenticateUser, getSettingsStats);
router.get("/penalty", authenticateUser, getPenaltySettings);
router.put("/penalty", authenticateUser, updatePenaltySettings);
router.put("/notifications", authenticateUser, updateNotificationSettings);
router.post("/reset", authenticateUser, resetSettings);

export default router;
