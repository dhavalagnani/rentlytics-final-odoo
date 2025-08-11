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
router.get("/getbyid", getPricelistById);

// Protected routes (admin only)
router.post("/create", authenticateUser, createPricelist);
router.patch("/update", authenticateUser, updatePricelist);
router.delete("/delete", authenticateUser, deletePricelist);

export default router;
