import express from 'express';
import {
  signup,
  validateOtp,
  login,
  getCurrentUser,
  logout
} from '../controllers/authController.js';
import {
  validateSignup,
  validateLogin,
  validateOtp as validateOtpMiddleware
} from '../middleware/validation.js';
import {
  signupRateLimiter,
  loginRateLimiter,
  otpRateLimiter
} from '../middleware/rateLimit.js';
import { authenticateUser } from '../middleware/auth.js';
import User from '../models/User.js';
import Otp from '../models/Otp.js';

const router = express.Router();

// Signup route
router.post('/signup', signupRateLimiter, validateSignup, signup);

// OTP validation route
router.post('/validate-otp', otpRateLimiter, validateOtpMiddleware, validateOtp);

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

    // Create new user (inactive)
    const user = new User({
      firstName,
      lastName,
      email,
      phone: cleanPhone,
      password,
      aadharNumber: cleanAadharNumber,
      isActive: false
    });

    await user.save();
    console.log('User saved successfully:', user._id);

    // Generate OTP (but don't send email)
    const otp = Otp.generateOtp();
    const otpDoc = Otp.createOtp(user._id, otp);
    await otpDoc.save();

    console.log('=== TEST SIGNUP SUCCESS ===');
    console.log('OTP for testing:', otp);
    console.log('OTP ID:', otpDoc._id);

    res.status(201).json({
      ok: true,
      message: 'Test signup successful - OTP logged in console',
      otpId: otpDoc._id,
      testOtp: otp, // Only for testing!
      userId: user._id
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
