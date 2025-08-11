import express from "express";
import {
  getPricelists,
  getPricelistById,
  createPricelist,
  updatePricelist,
  deletePricelist,
  getPricelistsByCustomerType,
  getPricelistsByRegion,
  getActivePricelists,
} from "../controllers/pricelist.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getPricelists);
router.get("/getbyid", getPricelistById);
router.get("/customer-type", getPricelistsByCustomerType);
router.get("/region", getPricelistsByRegion);
router.get("/active", getActivePricelists);

// Protected routes (admin only)
router.post("/create", authenticateUser, createPricelist);
router.patch("/update", updatePricelist); // Temporarily public for testing
router.delete("/delete", authenticateUser, deletePricelist);

export default router;
