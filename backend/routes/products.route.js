import express from "express";
import multer from "multer";
import {
  getProducts,
  getAllProductsPublic,
  getProductById,
  getProductsByCategory,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateUnitsAvailable,
  getProductsByOwner,
  getMyProducts,
  addProductImage,
  removeProductImage,
} from "../controllers/product.controller.js";
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

// Public routes
router.get("/", authenticateUser, getProducts); // Authenticated route - excludes user's own products
router.get("/public", getAllProductsPublic); // Public route - includes all products
router.get("/search", searchProducts); // Search products by name, category, and price
router.get("/category/:categoryId", getProductsByCategory); // Filter products by category
router.get("/my", authenticateUser, getMyProducts); // Get current user's products
router.get("/:id", getProductById);
router.get("/owner/:ownerId", getProductsByOwner);

// Owner only routes
router.post("/", authenticateUser, upload.single("image"), createProduct);
router.patch("/:id", authenticateUser, upload.single("image"), updateProduct);
router.delete("/:id", authenticateUser, deleteProduct);
router.patch("/:id/units", authenticateUser, updateUnitsAvailable);

// Image management routes
router.post(
  "/:id/images",
  authenticateUser,
  upload.single("image"),
  addProductImage
);
router.delete("/:id/images/:imageIndex", authenticateUser, removeProductImage);

export default router;
