import Pricelist from "../models/Pricelist.model.js";
import { validateRequest } from "../utils/validateRequest.js";

// Get all pricelists with pagination
export const getPricelists = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pricelists = await Pricelist.find().lean().skip(skip).limit(limit);

    const total = await Pricelist.countDocuments();

    res.json({
      success: true,
      data: {
        pricelists,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Pricelists retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get pricelist by ID
export const getPricelistById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pricelist = await Pricelist.findById(id).lean();

    if (!pricelist) {
      return res.status(404).json({
        success: false,
        message: "Pricelist not found",
      });
    }

    res.json({
      success: true,
      data: pricelist,
      message: "Pricelist retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Create new pricelist
export const createPricelist = async (req, res, next) => {
  try {
    const validation = validateRequest(req.body, [
      "pricelistId",
      "name",
      "targetCustomerTypes",
      "region",
      "baseRates",
      "validity",
    ]);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const pricelist = new Pricelist(req.body);
    await pricelist.save();

    res.status(201).json({
      success: true,
      data: pricelist,
      message: "Pricelist created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Pricelist with this pricelistId already exists",
      });
    }
    next(error);
  }
};

// Update pricelist
export const updatePricelist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const pricelist = await Pricelist.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!pricelist) {
      return res.status(404).json({
        success: false,
        message: "Pricelist not found",
      });
    }

    res.json({
      success: true,
      data: pricelist,
      message: "Pricelist updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete pricelist
export const deletePricelist = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pricelist = await Pricelist.findByIdAndDelete(id);

    if (!pricelist) {
      return res.status(404).json({
        success: false,
        message: "Pricelist not found",
      });
    }

    res.json({
      success: true,
      message: "Pricelist deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get pricelists by customer type
export const getPricelistsByCustomerType = async (req, res, next) => {
  try {
    const { customerType } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pricelists = await Pricelist.find({
      targetCustomerTypes: customerType,
      "validity.startDate": { $lte: new Date() },
      "validity.endDate": { $gte: new Date() },
    })
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Pricelist.countDocuments({
      targetCustomerTypes: customerType,
      "validity.startDate": { $lte: new Date() },
      "validity.endDate": { $gte: new Date() },
    });

    res.json({
      success: true,
      data: {
        pricelists,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: `Pricelists for ${customerType} customers retrieved successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Get pricelists by region
export const getPricelistsByRegion = async (req, res, next) => {
  try {
    const { region } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pricelists = await Pricelist.find({ region })
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Pricelist.countDocuments({ region });

    res.json({
      success: true,
      data: {
        pricelists,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: `Pricelists for ${region} region retrieved successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Get active pricelists
export const getActivePricelists = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pricelists = await Pricelist.find({
      "validity.startDate": { $lte: new Date() },
      "validity.endDate": { $gte: new Date() },
    })
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Pricelist.countDocuments({
      "validity.startDate": { $lte: new Date() },
      "validity.endDate": { $gte: new Date() },
    });

    res.json({
      success: true,
      data: {
        pricelists,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Active pricelists retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};
