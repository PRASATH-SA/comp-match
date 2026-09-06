const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['registration', 'login', 'reset'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index — auto-delete expired docs
  },
  attempts: {
    type: Number,
    default: 0,
  },
});

// Hash OTP code before saving
otpSchema.pre('save', async function (next) {
  if (!this.isModified('code')) return next();
  this.code = await bcrypt.hash(this.code, 10);
  next();
});

// Verify OTP code
otpSchema.methods.verifyCode = async function (candidateCode) {
  return bcrypt.compare(candidateCode, this.code);
};

module.exports = mongoose.model('OTP', otpSchema);
