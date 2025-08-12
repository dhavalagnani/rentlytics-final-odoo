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

// All routes require authentication for user-specific access
router.get("/", authenticateUser, getPricelists);
router.get("/getbyid", authenticateUser, getPricelistById);
router.get("/customer-type", authenticateUser, getPricelistsByCustomerType);
router.get("/region", authenticateUser, getPricelistsByRegion);
router.get("/active", authenticateUser, getActivePricelists);

// Protected routes (user-specific)
router.post("/create", authenticateUser, createPricelist);
router.patch("/update", authenticateUser, updatePricelist);
router.delete("/delete", authenticateUser, deletePricelist);

export default router;
