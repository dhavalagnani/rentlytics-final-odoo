import PriceRule from "../models/PriceRule.model.js";
import { validateRequest } from "../utils/validateRequest.js";
import { applyPriceRules } from "../utils/pricingEngine.js";

// Get all price rules with pagination
export const getPriceRules = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const priceRules = await PriceRule.find()
      .populate("productId", "name")
      .populate("categoryId", "name")
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await PriceRule.countDocuments();

    res.json({
      success: true,
      data: {
        priceRules,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Price rules retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get price rule by ID
export const getPriceRuleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const priceRule = await PriceRule.findById(id)
      .populate("productId", "name")
      .populate("categoryId", "name")
      .lean();

    if (!priceRule) {
      return res.status(404).json({
        success: false,
        message: "Price rule not found",
      });
    }

    res.json({
      success: true,
      data: priceRule,
      message: "Price rule retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Create new price rule
export const createPriceRule = async (req, res, next) => {
  try {
    const validation = validateRequest(req.body, [
      "ruleId",
      "name",
      "priority",
      "validity",
      "conditions",
      "effect",
    ]);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const priceRule = new PriceRule(req.body);
    await priceRule.save();

    const populatedPriceRule = await PriceRule.findById(priceRule._id)
      .populate("productId", "name")
      .populate("categoryId", "name");

    res.status(201).json({
      success: true,
      data: populatedPriceRule,
      message: "Price rule created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Price rule with this ruleId already exists",
      });
    }
    next(error);
  }
};

// Update price rule
export const updatePriceRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const priceRule = await PriceRule.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("productId", "name")
      .populate("categoryId", "name");

    if (!priceRule) {
      return res.status(404).json({
        success: false,
        message: "Price rule not found",
      });
    }

    res.json({
      success: true,
      data: priceRule,
      message: "Price rule updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete price rule
export const deletePriceRule = async (req, res, next) => {
  try {
    const { id } = req.params;

    const priceRule = await PriceRule.findByIdAndDelete(id);

    if (!priceRule) {
      return res.status(404).json({
        success: false,
        message: "Price rule not found",
      });
    }

    res.json({
      success: true,
      message: "Price rule deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Toggle price rule enabled status
export const togglePriceRule = async (req, res, next) => {
  try {
    const { id } = req.params;

    const priceRule = await PriceRule.findById(id);
    if (!priceRule) {
      return res.status(404).json({
        success: false,
        message: "Price rule not found",
      });
    }

    priceRule.enabled = !priceRule.enabled;
    await priceRule.save();

    const populatedPriceRule = await PriceRule.findById(priceRule._id)
      .populate("productId", "name")
      .populate("categoryId", "name");

    res.json({
      success: true,
      data: populatedPriceRule,
      message: `Price rule ${
        priceRule.enabled ? "enabled" : "disabled"
      } successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Get price rules by product
export const getPriceRulesByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const priceRules = await PriceRule.find({
      $or: [
        { productId },
        { productId: { $exists: false } }, // Global rules
      ],
      enabled: true,
      "validity.startDate": { $lte: new Date() },
      "validity.endDate": { $gte: new Date() },
    })
      .populate("categoryId", "name")
      .sort({ priority: 1 })
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await PriceRule.countDocuments({
      $or: [{ productId }, { productId: { $exists: false } }],
      enabled: true,
      "validity.startDate": { $lte: new Date() },
      "validity.endDate": { $gte: new Date() },
    });

    res.json({
      success: true,
      data: {
        priceRules,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Product price rules retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get price rules by category
export const getPriceRulesByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const priceRules = await PriceRule.find({
      $or: [
        { categoryId },
        { categoryId: { $exists: false } }, // Global rules
      ],
      enabled: true,
      "validity.startDate": { $lte: new Date() },
      "validity.endDate": { $gte: new Date() },
    })
      .populate("productId", "name")
      .sort({ priority: 1 })
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await PriceRule.countDocuments({
      $or: [{ categoryId }, { categoryId: { $exists: false } }],
      enabled: true,
      "validity.startDate": { $lte: new Date() },
      "validity.endDate": { $gte: new Date() },
    });

    res.json({
      success: true,
      data: {
        priceRules,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Category price rules retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get active price rules
export const getActivePriceRules = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const priceRules = await PriceRule.find({
      enabled: true,
      "validity.startDate": { $lte: new Date() },
      "validity.endDate": { $gte: new Date() },
    })
      .populate("productId", "name")
      .populate("categoryId", "name")
      .sort({ priority: 1 })
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await PriceRule.countDocuments({
      enabled: true,
      "validity.startDate": { $lte: new Date() },
      "validity.endDate": { $gte: new Date() },
    });

    res.json({
      success: true,
      data: {
        priceRules,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Active price rules retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Test price rule evaluation
export const testPriceRule = async (req, res, next) => {
  try {
    const { baseRates, bookingData } = req.body;

    if (!baseRates || !bookingData) {
      return res.status(400).json({
        success: false,
        message: "baseRates and bookingData are required",
      });
    }

    // Get applicable price rules
    const priceRules = await PriceRule.find({
      enabled: true,
      "validity.startDate": { $lte: new Date() },
      "validity.endDate": { $gte: new Date() },
    }).sort({ priority: 1 });

    // Apply price rules
    const result = await applyPriceRules(baseRates, priceRules, bookingData);

    res.json({
      success: true,
      data: result,
      message: "Price rule evaluation completed successfully",
    });
  } catch (error) {
    next(error);
  }
};
