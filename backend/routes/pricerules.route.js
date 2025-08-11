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
router.get("/:id", getPriceRuleById);

// Protected routes (admin only)
router.post("/", authenticateUser, createPriceRule);
router.patch("/:id", authenticateUser, updatePriceRule);
router.delete("/:id", authenticateUser, deletePriceRule);
router.patch(
  "/:id/toggle",
  authenticateUser,
  togglePriceRule
);
router.post(
  "/:id/test",
  authenticateUser,
  testPriceRule
);

export default router;
