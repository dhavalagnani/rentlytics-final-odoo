import rateLimit from 'express-rate-limit';

// Rate limiting configuration
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW) || 60000; // 1 minute
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX) || 3;

// Signup rate limiter
export const signupRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  message: {
    ok: false,
    message: 'Too many signup attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login rate limiter
export const loginRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  message: {
    ok: false,
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
