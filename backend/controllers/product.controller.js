import Product from "../models/Product.model.js";
import { validateRequest } from "../utils/validateRequest.js";

// Get all products with pagination
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .populate("ownerId", "name email")
      .populate("categoryId", "name")
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments();

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Products retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("ownerId", "name email")
      .populate("categoryId", "name")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
      message: "Product retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Create new product (only owners)
export const createProduct = async (req, res, next) => {
  try {
    const validation = validateRequest(req.body, [
      "productId",
      "ownerId",
      "categoryId",
      "name",
      "description",
      "depositAmount",
      "baseRates",
    ]);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Check if user is owner
    if (!req.user.isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only owners can create products",
      });
    }

    // Ensure ownerId matches authenticated user
    if (req.body.ownerId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only create products for yourself",
      });
    }

    const product = new Product(req.body);
    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate("ownerId", "name email")
      .populate("categoryId", "name");

    res.status(201).json({
      success: true,
      data: populatedProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with this productId already exists",
      });
    }
    next(error);
  }
};

// Update product (only owners)
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user is owner
    if (!req.user.isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only owners can update products",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Ensure user owns this product
    if (product.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own products",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("ownerId", "name email")
      .populate("categoryId", "name");

    res.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete product (only owners)
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if user is owner
    if (!req.user.isOwner) {
      return res.status(403).json({
        success: false,
        message: "Only owners can delete products",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Ensure user owns this product
    if (product.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own products",
      });
    }

    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Update product units available
export const updateUnitsAvailable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { unitsAvailable } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { unitsAvailable },
      { new: true, runValidators: true }
    )
      .populate("ownerId", "name email")
      .populate("categoryId", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
      message: "Product units updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get products by owner
export const getProductsByOwner = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ ownerId })
      .populate("categoryId", "name")
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ ownerId });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Owner products retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};
