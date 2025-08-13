import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { responses } from "../utils/responseHelper.js";

// Middleware to authenticate user
export const authenticateUser = async (req, res, next) => {
  try {
    // Check for token in Authorization header first, then cookies
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      token = req.cookies.token;
    }

    if (!token) {
      return responses.unauthorized(res, "Access denied. No token provided.");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.sub || decoded.userId).select("-passwordHash");

    if (!user) {
      return responses.unauthorized(res, "Invalid token. User not found.");
    }

    req.user = user;
    next();
  } catch (error) {
    return responses.unauthorized(res, "Invalid or expired token.");
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.sub || decoded.userId).select("-passwordHash");

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
