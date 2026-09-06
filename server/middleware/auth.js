const { verifyToken } = require('../utils/token');
const User = require('../models/User');

/**
 * Authentication middleware — verifies JWT from cookie or Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Fallback to Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Optional authentication — attaches user if token exists, but doesn't block
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
  } catch (error) {
    // Silently continue without user
  }
  next();
};

module.exports = { authenticate, optionalAuth };
