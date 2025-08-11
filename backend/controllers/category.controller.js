import Category from "../models/Category.model.js";
import { validateRequest } from "../utils/validateRequest.js";

// Get all categories with pagination
export const getCategories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const categories = await Category.find().lean().skip(skip).limit(limit);

    const total = await Category.countDocuments();

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Categories retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get category by ID
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
      message: "Category retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Create new category
export const createCategory = async (req, res, next) => {
  try {
    const validation = validateRequest(req.body, [
      "categoryId",
      "name",
      "description",
    ]);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const category = new Category(req.body);
    await category.save();

    res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category with this categoryId already exists",
      });
    }
    next(error);
  }
};

// Update category
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete category
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
