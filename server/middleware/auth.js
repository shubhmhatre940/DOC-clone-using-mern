import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes - Verifies JWT Bearer token and attaches user to req
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_for_google_docs_clone_12345'
      );

      // Get user from database without password
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'User not found or token invalid' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
