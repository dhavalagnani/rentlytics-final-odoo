import express from "express";
import multer from "multer";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateUnitsAvailable,
  getProductsByOwner,
  addProductImage,
  removeProductImage,
} from "../controllers/product.controller.js";
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

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/owner/:ownerId", getProductsByOwner);

// Owner only routes
router.post("/", authenticateToken, upload.single("image"), createProduct);
router.patch("/:id", authenticateToken, upload.single("image"), updateProduct);
router.delete("/:id", authenticateToken, deleteProduct);
router.patch("/:id/units", authenticateToken, updateUnitsAvailable);

// Image management routes
router.post(
  "/:id/images",
  authenticateToken,
  upload.single("image"),
  addProductImage
);
router.delete("/:id/images/:imageIndex", authenticateToken, removeProductImage);

export default router;
