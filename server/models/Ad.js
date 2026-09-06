const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Ad title is required'],
      trim: true,
      maxlength: 200,
    },
    image: {
      url: String,
      key: String,
    },
    link: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['custom-banner', 'amazon-referral', 'google-adsense'],
      required: true,
    },
    placement: {
      type: String,
      enum: ['home-hero', 'home-mid', 'category-top', 'product-sidebar', 'product-bottom'],
      required: true,
    },
    amazonAffiliateTag: {
      type: String,
      trim: true,
    },
    adsenseSlotId: {
      type: String,
      trim: true,
    },
    adSize: {
      type: String,
      default: 'responsive', // 'responsive', '300x250', '728x90', '320x50'
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ad', adSchema);
