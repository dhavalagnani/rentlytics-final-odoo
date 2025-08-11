import rateLimit from 'express-rate-limit';

// Rate limiter for OTP requests
export const otpRateLimiter = rateLimit({
  windowMs: parseInt(process.env.OTP_RATE_LIMIT_WINDOW) || 60000, // 1 minute
  max: parseInt(process.env.OTP_RATE_LIMIT_MAX) || 3, // limit each IP to 3 requests per windowMs
  message: {
    ok: false,
    message: 'Too many OTP requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use email as key for OTP rate limiting
    return req.body.email || req.ip;
  }
});

// Rate limiter for login attempts
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    ok: false,
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use email as key for login rate limiting
    return req.body.email || req.ip;
  }
});

// Rate limiter for signup
export const signupRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 signup attempts per hour
  message: {
    ok: false,
    message: 'Too many signup attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
