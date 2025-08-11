import express from "express";
import {
  getPriceRules,
  getPriceRuleById,
  createPriceRule,
  updatePriceRule,
  deletePriceRule,
  togglePriceRule,
  testPriceRule,
  getPriceRulesByProduct,
  getPriceRulesByCategory,
  getActivePriceRules,
} from "../controllers/priceRule.controller.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getPriceRules);
router.get("/getbyid", getPriceRuleById);
router.get("/product", getPriceRulesByProduct);
router.get("/category", getPriceRulesByCategory);
router.get("/active", getActivePriceRules);

// Protected routes (admin only)
router.post("/create", authenticateUser, createPriceRule);
router.patch("/update", authenticateUser, updatePriceRule);
router.delete("/delete", authenticateUser, deletePriceRule);
router.patch("/toggle", authenticateUser, togglePriceRule);
router.post("/test", authenticateUser, testPriceRule);

export default router;
