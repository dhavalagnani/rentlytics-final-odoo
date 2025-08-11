import User from "../models/User.model.js";
import Otp from "../models/Otp.model.js";
import {
  generateToken,
  getCookieOptions,
  getClearCookieOptions,
} from "../utils/jwt.js";
import { sendOtpEmail } from "../utils/mailer.js";

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

    // Create new user (inactive)
    const user = new User({
      firstName,
      lastName,
      email,
      phone: cleanPhone,
      password, // Will be hashed by the virtual setter
      aadharNumber: cleanAadharNumber,
      isActive: false,
    });

    await user.save();
    console.log("User saved successfully:", user._id);

    // Generate OTP
    console.log("Generating OTP...");
    const otp = Otp.generateOtp();
    console.log("OTP generated:", otp);

    const otpDoc = Otp.createOtp(user._id, otp);
    await otpDoc.save();
    console.log("OTP saved successfully:", otpDoc._id);

    // Send OTP email
    console.log("Sending OTP email...");
    try {
      await sendOtpEmail(email, firstName, otp);
      console.log("OTP email sent successfully");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail the signup if email fails, just log it
      // In production, you might want to handle this differently
    }

    res.status(201).json({
      ok: true,
      message: "OTP sent to your email. Please check and validate.",
      otpId: otpDoc._id,
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

// OTP validation controller
export const validateOtp = async (req, res) => {
  try {
    const { otpId, otp } = req.body;

    // Find OTP document
    const otpDoc = await Otp.findById(otpId);
    if (!otpDoc) {
      return res.status(400).json({
        ok: false,
        message: "Invalid OTP ID",
      });
    }

    // Check if OTP is already used
    if (otpDoc.isUsed) {
      return res.status(400).json({
        ok: false,
        message: "OTP has already been used",
      });
    }

    // Check if OTP is expired
    if (new Date() > otpDoc.expiresAt) {
      return res.status(400).json({
        ok: false,
        message: "OTP has expired",
      });
    }

    // Check attempts limit
    if (otpDoc.attempts >= 5) {
      return res.status(400).json({
        ok: false,
        message: "Too many failed attempts. Please request a new OTP",
      });
    }

    // Verify OTP
    if (!otpDoc.verifyOtp(otp)) {
      await otpDoc.incrementAttempts();
      return res.status(400).json({
        ok: false,
        message: "Invalid OTP",
      });
    }

    // Mark OTP as used
    await otpDoc.markAsUsed();

    // Activate user
    const user = await User.findById(otpDoc.userId);
    if (!user) {
      return res.status(400).json({
        ok: false,
        message: "User not found",
      });
    }

    user.isActive = true;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie("token", token, getCookieOptions());

    res.json({
      ok: true,
      message: "Email verified successfully",
      firstName: user.firstName,
    });
  } catch (error) {
    console.error("OTP validation error:", error);
    res.status(500).json({
      ok: false,
      message: "Internal server error during OTP validation",
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

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        ok: false,
        message: "Account not activated. Please verify your email first",
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
    res.cookie("token", token, getCookieOptions());

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
