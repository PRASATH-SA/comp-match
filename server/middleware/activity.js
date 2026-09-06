const User = require('../models/User');
const UserActivity = require('../models/UserActivity');

/**
 * Activity tracking middleware — logs page views and updates lastActive
 * Used on authenticated routes to track user behavior
 */
const trackActivity = async (req, res, next) => {
  if (req.user) {
    try {
      // Update last active timestamp
      await User.findByIdAndUpdate(req.user._id, {
        lastActive: new Date(),
      });
    } catch (error) {
      // Don't block the request if tracking fails
      console.error('Activity tracking error:', error.message);
    }
  }
  next();
};

module.exports = { trackActivity };
