import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('=== VALIDATION ERRORS DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
    console.log('================================');
    
    return res.status(400).json({
      ok: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Signup validation rules
export const validateSignup = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be between 1 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be between 1 and 50 characters'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .trim()
    .custom((value) => {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Check if it's exactly 10 digits
      if (digitsOnly.length !== 10) {
        throw new Error('Please provide a valid 10-digit phone number');
      }
      return true;
    })
    .withMessage('Please provide a valid 10-digit phone number'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  body('aadharNumber')
    .trim()
    .custom((value) => {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Check if it's exactly 12 digits
      if (digitsOnly.length !== 12) {
        throw new Error('Please provide a valid 12-digit Aadhar number');
      }
      return true;
    })
    .withMessage('Please provide a valid 12-digit Aadhar number'),
  
  handleValidationErrors
];

// Login validation rules
export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];
