const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: ['page_view', 'product_view', 'search', 'cart_add', 'enquiry'],
    required: true,
  },
  page: {
    type: String,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  duration: {
    type: Number,
    default: 0, // seconds spent on page
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for efficient admin queries
userActivitySchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);
