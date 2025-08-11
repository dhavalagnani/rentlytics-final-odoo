import User from "../models/User.model.js";
import Booking from "../models/Booking.model.js";
import { validateRequest } from "../utils/validateRequest.js";

// Get all users with pagination
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-passwordHash")
      .lean()
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Users retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-passwordHash").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
      message: "User retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Create new user
export const createUser = async (req, res, next) => {
  try {
    const validation = validateRequest(req.body, [
      "userId",
      "name",
      "email",
      "phone",
      "passwordHash",
    ]);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const user = new User(req.body);
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({
      success: true,
      data: userResponse,
      message: "User created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User with this email or userId already exists",
      });
    }
    next(error);
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
      message: "User updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Mark user as owner
export const markAsOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isOwner, verificationStatus } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isOwner, verificationStatus },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
      message: "User owner status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get user stats
export const getUserStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Aggregate booking stats
    const stats = await Booking.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: "$pricingSnapshot.totalPrice" },
        },
      },
    ]);

    const userStats = stats[0] || { totalBookings: 0, totalSpent: 0 };

    // Update user stats
    await User.findByIdAndUpdate(id, {
      stats: {
        totalBookings: userStats.totalBookings,
        totalSpent: userStats.totalSpent,
      },
    });

    res.json({
      success: true,
      data: userStats,
      message: "User stats retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};
