import express from "express";
import {
  getPricelists,
  getPricelistById,
  createPricelist,
  updatePricelist,
  deletePricelist,
} from "../controllers/pricelist.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getPricelists);
router.get("/:id", getPricelistById);

// Protected routes (admin only)
router.post("/", authenticateUser, createPricelist);
router.patch(
  "/:id",
  authenticateUser,
  updatePricelist
);
router.delete(
  "/:id",
  authenticateUser,
  deletePricelist
);

export default router;
