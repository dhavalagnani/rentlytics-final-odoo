import User from '../models/User.js';
import { generateToken, getCookieOptions, getClearCookieOptions } from '../utils/jwt.js';

// Signup controller
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, aadharNumber } = req.body;

    // Clean phone and aadhar number (remove non-digit characters)
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanAadharNumber = aadharNumber.replace(/\D/g, '');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        ok: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user (active immediately)
    const user = new User({
      firstName,
      lastName,
      email,
      phone: cleanPhone,
      password, // Will be hashed by the virtual setter
      aadharNumber: cleanAadharNumber,
      isActive: true // User is active immediately
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      ok: true,
      message: 'Account created successfully!',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userId: user.userId
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = 'Duplicate field error';
      
      if (field === 'email') {
        message = 'User with this email already exists';
      } else if (field === 'userId') {
        message = 'User ID generation failed. Please try again.';
      }
      
      return res.status(400).json({
        ok: false,
        message: message
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        ok: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      ok: false,
      message: 'Internal server error during signup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        message: 'Invalid email or password'
      });
    }

    // Verify password
    if (!user.comparePassword(password)) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);
    
    // Set cookie
    res.cookie('token', token, getCookieOptions());

    res.json({
      ok: true,
      message: 'Login successful',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userId: user.userId
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      ok: false,
      message: 'Internal server error during login'
    });
  }
};

// Get current user controller
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      ok: true,
      user: {
        id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      ok: false,
      message: 'Internal server error'
    });
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.cookie('token', '', getClearCookieOptions());
    
    res.json({
      ok: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      ok: false,
      message: 'Internal server error during logout'
    });
  }
};
