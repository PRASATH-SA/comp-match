const mongoose = require('mongoose');

// Counter schema for auto-incrementing product IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

/**
 * Generate the next product ID in format CM-XXXX
 * Uses atomic findOneAndUpdate for concurrency safety
 * @returns {string} e.g. "CM-0001", "CM-0002"
 */
const generateProductId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'productId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `CM-${String(counter.seq).padStart(4, '0')}`;
};

module.exports = { generateProductId };
