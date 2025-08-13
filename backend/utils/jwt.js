import jwt from 'jsonwebtoken';

// Helper function to issue JWT and set as httpOnly cookie
export const issueJwt = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EXPIRES_MS) || 7*24*60*60*1000
  });
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: parseInt(process.env.JWT_EXPIRES_MS) || 7*24*60*60*1000,
    path: '/'
  };
  
  res.cookie("token", token, cookieOptions);
  return token;
};

// Generate JWT token (legacy function - use issueJwt instead)
export const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured in environment variables');
    throw new Error('JWT_SECRET is not configured');
  }
  
  if (!userId) {
    throw new Error('userId is required to generate token');
  }
  
  try {
    const token = jwt.sign(
      { sub: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    console.log(`Token generated for user: ${userId}`);
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate token');
  }
};

// Verify JWT token (legacy function - use jwt.verify directly)
export const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured in environment variables');
    throw new Error('JWT_SECRET is not configured');
  }
  
  if (!token) {
    throw new Error('Token is required for verification');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Token verified for user: ${decoded.sub || decoded.userId}`);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Get cookie options for JWT
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: isProduction ? undefined : undefined // Let browser set domain in development
  };
};

// Clear cookie options (for logout)
export const getClearCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    expires: new Date(0),
    path: '/',
    domain: isProduction ? undefined : undefined // Let browser set domain in development
  };
};
