import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-here-change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export const generateToken = (userId) => {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured in environment variables');
    throw new Error('JWT_SECRET is not configured');
  }
  
  if (!userId) {
    throw new Error('userId is required to generate token');
  }
  
  try {
    const token = jwt.sign(
      { userId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    console.log(`Token generated for user: ${userId}`);
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate token');
  }
};

// Verify JWT token
export const verifyToken = (token) => {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not configured in environment variables');
    throw new Error('JWT_SECRET is not configured');
  }
  
  if (!token) {
    throw new Error('Token is required for verification');
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`Token verified for user: ${decoded.userId}`);
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
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  };
};

// Clear cookie options (for logout)
export const getClearCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    expires: new Date(0),
    path: '/'
  };
};
