import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateUnitsAvailable,
  getProductsByOwner,
} from "../controllers/product.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/owner/:ownerId", getProductsByOwner);

// Owner only routes
router.post("/", authenticateUser, createProduct);
router.patch("/:id", authenticateUser, updateProduct);
router.delete("/:id", authenticateUser, deleteProduct);
router.patch("/:id/units", authenticateUser, updateUnitsAvailable);

export default router;
