import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  markAsOwner,
  getUserStats,
} from "../controllers/user.controller.js";
import { authenticateUser } from "../middleware/auth.js";
const router = express.Router();

// Public routes
router.get("/", getUsers);
router.get("/:id", getUserById);

// Protected routes
router.post("/", authenticateUser, createUser);
router.patch("/:id", authenticateUser, updateUser);
router.delete("/:id", authenticateUser, deleteUser);

// Admin only routes
router.patch(
  "/:id/owner",
  authenticateUser,
  markAsOwner
);
router.get("/:id/stats", authenticateUser, getUserStats);

export default router;
