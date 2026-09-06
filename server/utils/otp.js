const crypto = require('crypto');

/**
 * Generate a random 6-digit OTP code
 * @returns {string} 6-digit code
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

module.exports = { generateOTP };
