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
router.get("/getbyid", getCategoryById);

// Admin only routes
router.post("/create", authenticateUser, createCategory);
router.patch("/update", authenticateUser, updateCategory);
router.delete("/delete", authenticateUser, deleteCategory);

export default router;
