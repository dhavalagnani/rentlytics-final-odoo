import User from "../models/User.model.js";
import {
  issueJwt,
  getClearCookieOptions,
} from "../utils/jwt.js";
import { responses } from "../utils/responseHelper.js";

// Signup controller
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, aadharNumber } = req.body;

    // Clean phone and aadhar number (remove non-digit characters)
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanAadharNumber = aadharNumber.replace(/\D/g, "");

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return responses.conflict(res, "User with this email already exists");
    }

    // Create new user (active by default)
    const user = new User({
      firstName,
      lastName,
      email,
      phone: cleanPhone,
      password, // Will be hashed by the virtual setter
      aadharNumber: cleanAadharNumber,
      isActive: true, // Set to true since no OTP verification needed
    });

    await user.save();

    // Generate JWT token and set cookie
    issueJwt(res, { sub: user._id, email: user.email });

    responses.created(res, { firstName: user.firstName }, "User registered successfully");
  } catch (error) {
    responses.internalError(res, "Internal server error during signup");
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return responses.unauthorized(res, "Invalid email or password");
    }

    // Verify password
    if (!user.comparePassword(password)) {
      return responses.unauthorized(res, "Invalid email or password");
    }

    // Generate JWT token and set cookie
    issueJwt(res, { sub: user._id, email: user.email });

    responses.ok(res, { firstName: user.firstName }, "Login successful");
  } catch (error) {
    responses.internalError(res, "Internal server error during login");
  }
};

// Get current user controller
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    responses.ok(res, { user: user.toPublicJSON() });
  } catch (error) {
    responses.internalError(res, "Internal server error");
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    // Clear cookie
    res.cookie("token", "", getClearCookieOptions());

    responses.ok(res, null, "Logged out successfully");
  } catch (error) {
    responses.internalError(res, "Internal server error during logout");
  }
};
