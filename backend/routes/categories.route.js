import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin only routes
router.post("/", authenticateUser, createCategory);
router.patch("/:id", authenticateUser, updateCategory);
router.delete("/:id", authenticateUser, deleteCategory);

export default router;
