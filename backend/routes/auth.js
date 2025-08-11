import express from 'express';
import {
  signup,
  login,
  getCurrentUser,
  logout
} from '../controllers/authController.js';
import {
  validateSignup,
  validateLogin
} from '../middleware/validation.js';
import {
  signupRateLimiter,
  loginRateLimiter
} from '../middleware/rateLimit.js';
import { authenticateUser } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Signup route
router.post('/signup', signupRateLimiter, validateSignup, signup);

// Login route
router.post('/login', loginRateLimiter, validateLogin, login);

// Get current user route (protected)
router.get('/me', authenticateUser, getCurrentUser);

// Logout route
router.post('/logout', logout);

// Test signup route (for debugging)
router.post('/test-signup', signupRateLimiter, validateSignup, async (req, res) => {
  try {
    console.log('=== TEST SIGNUP REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { firstName, lastName, email, phone, password, aadharNumber } = req.body;

    // Clean phone and aadhar number
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
      password,
      aadharNumber: cleanAadharNumber,
      isActive: true
    });

    await user.save();
    console.log('User saved successfully:', user._id);

    console.log('=== TEST SIGNUP SUCCESS ===');
    console.log('User created:', user.firstName, user.lastName);

    res.status(201).json({
      ok: true,
      message: 'Test signup successful',
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName
    });

  } catch (error) {
    console.error('Test signup error:', error);
    res.status(500).json({
      ok: false,
      message: 'Test signup failed',
      error: error.message
    });
  }
});

export default router;
