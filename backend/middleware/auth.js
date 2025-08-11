import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.model.js";

// Middleware to authenticate user
export const authenticateUser = async (req, res, next) => {
  try {
    console.log("=== AUTH MIDDLEWARE DEBUG ===");
    console.log("Cookies:", req.cookies);
    
    const token = req.cookies.token;

    if (!token) {
      console.log("No token found in cookies");
      return res.status(401).json({
        ok: false,
        message: "Access denied. No token provided.",
      });
    }

    console.log("Token found, verifying...");

    // Verify token
    const decoded = verifyToken(token);
    console.log("Token verified, decoded:", decoded);

    // Get user from database
    const user = await User.findById(decoded.userId).select("-passwordHash");
    console.log("User found:", user ? user._id : "Not found");

    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({
        ok: false,
        message: "Invalid token. User not found.",
      });
    }

    console.log("User authenticated successfully:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      ok: false,
      message: error.message || "Invalid token.",
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select("-passwordHash");

      if (user) {
        req.user = user;
        console.log("Optional auth: User found:", user.email);
      }
    }

    next();
  } catch (error) {
    console.log("Optional auth: Token verification failed, continuing without auth");
    next();
  }
};
