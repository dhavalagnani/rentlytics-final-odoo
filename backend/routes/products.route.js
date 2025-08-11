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
router.get("/", getProducts);
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
