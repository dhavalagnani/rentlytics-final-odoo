import express from "express";
import {
  getPriceRules,
  getPriceRuleById,
  createPriceRule,
  updatePriceRule,
  deletePriceRule,
  togglePriceRule,  
  testPriceRule,
} from "../controllers/priceRule.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getPriceRules);
router.get("/getbyid", getPriceRuleById);

// Protected routes (admin only)
router.post("/create", authenticateUser, createPriceRule);
router.patch("/update", authenticateUser, updatePriceRule);
router.delete("/delete", authenticateUser, deletePriceRule);
router.patch(
  "/toggle",
  authenticateUser,
  togglePriceRule
);
router.post(
  "/test",
  authenticateUser,
  testPriceRule
);

export default router;
