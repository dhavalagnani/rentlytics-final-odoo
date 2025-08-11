import User from "../models/User.model.js";
import {
  generateToken,
  getCookieOptions,
  getClearCookieOptions,
} from "../utils/jwt.js";

// Signup controller
export const signup = async (req, res) => {
  try {
    console.log("=== SIGNUP REQUEST DEBUG ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Content-Type:", req.get("Content-Type"));
    console.log("================================");

    const { firstName, lastName, email, phone, password, aadharNumber } =
      req.body;

    // Clean phone and aadhar number (remove non-digit characters)
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanAadharNumber = aadharNumber.replace(/\D/g, "");

    console.log("Cleaned phone:", cleanPhone);
    console.log("Cleaned aadhar:", cleanAadharNumber);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        ok: false,
        message: "User with this email already exists",
      });
    }

    console.log("Creating new user...");

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
    console.log("User saved successfully:", user._id);

    // Generate JWT token
    const token = generateToken(user._id);

    // Set cookie
    const cookieOptions = getCookieOptions();
    console.log("Setting cookie with options:", cookieOptions);
    res.cookie("token", token, cookieOptions);

    console.log("Signup successful for user:", user.email);
    console.log("Cookie set:", token.substring(0, 20) + "...");

    res.status(201).json({
      ok: true,
      message: "User registered successfully",
      firstName: user.firstName,
    });
  } catch (error) {
    console.error("=== SIGNUP ERROR DETAILS ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    console.error("================================");

    res.status(500).json({
      ok: false,
      message: "Internal server error during signup",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    if (!user.comparePassword(password)) {
      return res.status(401).json({
        ok: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Set cookie
    const cookieOptions = getCookieOptions();
    console.log("Setting cookie with options:", cookieOptions);
    res.cookie("token", token, cookieOptions);

    console.log("Login successful for user:", user.email);
    console.log("Cookie set:", token.substring(0, 20) + "...");

    res.json({
      ok: true,
      message: "Login successful",
      firstName: user.firstName,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error during login",
    });
  }
};

// Get current user controller
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      ok: true,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    // Clear cookie
    res.cookie("token", "", getClearCookieOptions());

    res.json({
      ok: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error during logout",
    });
  }
};
