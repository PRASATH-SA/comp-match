const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, query, validationResult } = require('express-validator');

// Config
const { uploadToR2, deleteFromR2 } = require('./config/r2');
const { sendOTPEmail } = require('./config/email');
const passport = require('./config/passport');

// Models
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Enquiry = require('./models/Enquiry');
const Cart = require('./models/Cart');
const Ad = require('./models/Ad');
const OTP = require('./models/OTP');
const UserActivity = require('./models/UserActivity');

// Middleware
const { authenticate, optionalAuth } = require('./middleware/auth');
const { requireAdmin } = require('./middleware/admin');
const { trackActivity } = require('./middleware/activity');

// Utils
const { generateToken } = require('./utils/token');
const { generateOTP } = require('./utils/otp');
const { generateProductId } = require('./utils/productId');

// Multer setup — memory storage for R2 upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Validation error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ═══════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════

// Register with email + password
router.post(
  '/auth/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user exists
      const existing = await User.findOne({ email });
      if (existing && existing.isVerified) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Delete unverified user if exists (re-registration)
      if (existing && !existing.isVerified) {
        await User.deleteOne({ _id: existing._id });
      }

      // Create user (unverified)
      const user = await User.create({
        name,
        email,
        password,
        provider: 'email',
        isVerified: false,
      });

      // Generate and send OTP
      const code = generateOTP();
      await OTP.deleteMany({ email, purpose: 'registration' });
      await OTP.create({
        email,
        code,
        purpose: 'registration',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      await sendOTPEmail(email, code, 'registration');

      res.status(201).json({
        message: 'Registration successful. Please verify your email with the OTP sent.',
        email,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Verify OTP
router.post(
  '/auth/verify-otp',
  [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('purpose').isIn(['registration', 'login', 'reset']),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, code, purpose } = req.body;

      const otpDoc = await OTP.findOne({ email, purpose });
      if (!otpDoc) {
        return res.status(400).json({ error: 'OTP not found or expired' });
      }

      if (otpDoc.attempts >= 5) {
        await OTP.deleteOne({ _id: otpDoc._id });
        return res.status(400).json({ error: 'Too many attempts. Please request a new OTP.' });
      }

      const isValid = await otpDoc.verifyCode(code);
      if (!isValid) {
        otpDoc.attempts += 1;
        await otpDoc.save();
        return res.status(400).json({ error: 'Invalid OTP', attemptsLeft: 5 - otpDoc.attempts });
      }

      // OTP verified — activate user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.isVerified = true;
      user.lastActive = new Date();
      await user.save();

      // Clean up OTP
      await OTP.deleteMany({ email, purpose });

      // Issue JWT
      const token = generateToken({ id: user._id, role: user.role });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ message: 'Email verified successfully', user, token });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  }
);

// Resend OTP
router.post(
  '/auth/resend-otp',
  [
    body('email').isEmail().normalizeEmail(),
    body('purpose').isIn(['registration', 'login', 'reset']),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, purpose } = req.body;

      // Delete old OTPs
      await OTP.deleteMany({ email, purpose });

      // Generate new OTP
      const code = generateOTP();
      await OTP.create({
        email,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      await sendOTPEmail(email, code, purpose);

      res.json({ message: 'OTP resent successfully' });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ error: 'Failed to resend OTP' });
    }
  }
);

// Login with email + password
router.post(
  '/auth/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user || user.provider !== 'email') {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (!user.isVerified) {
        return res.status(401).json({ error: 'Please verify your email first', needsVerification: true });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      user.lastActive = new Date();
      await user.save();

      const token = generateToken({ id: user._id, role: user.role });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ user, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Google OAuth — redirect to Google consent screen
router.get('/auth/google', (req, res, next) => {
  if (!passport._strategy('google')) {
    return res.status(503).json({ error: 'Google OAuth is not configured on this server.' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google OAuth callback
router.get(
  '/auth/google/callback',
  (req, res, next) => {
    if (!passport._strategy('google')) {
      const redirectUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      return res.redirect(`${redirectUrl}/login?error=google_not_configured`);
    }
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google`,
    })(req, res, next);
  },
  (req, res) => {
    const token = generateToken({ id: req.user._id, role: req.user.role });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/?auth=success`);
  }
);

// Get current user (returns null if unauthenticated guest)
router.get('/auth/me', optionalAuth, (req, res) => {
  res.json({ user: req.user || null });
});

// Logout
router.post('/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// ═══════════════════════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════════════════════

// List products with filters
router.get('/products', async (req, res) => {
  try {
    const {
      category,
      condition,
      type,
      brand,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 12,
      featured,
    } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (type) filter.type = type;
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (featured === 'true') filter.featured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Featured products
router.get('/products/featured', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, featured: true })
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(8);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// Get single product by slug
router.get('/products/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
      'category',
      'name slug'
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (admin)
router.post('/products', authenticate, requireAdmin, async (req, res) => {
  try {
    const productId = await generateProductId();
    const product = await Product.create({ ...req.body, productId });
    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin)
router.put('/products/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin) — soft delete
router.delete('/products/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deactivated', product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ═══════════════════════════════════════════════════════════
//  CATEGORIES
// ═══════════════════════════════════════════════════════════

// List categories
router.get('/categories', async (req, res) => {
  try {
    const filter = {};
    if (req.query.active !== 'false') filter.isActive = true;
    const categories = await Category.find(filter).populate('parent', 'name slug').sort('order');
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category (admin)
router.post('/categories', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (admin)
router.put('/categories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (admin)
router.delete('/categories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    // Check if category has products
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ error: `Cannot delete: ${productCount} products belong to this category` });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ═══════════════════════════════════════════════════════════
//  ENQUIRIES
// ═══════════════════════════════════════════════════════════

// Submit enquiry
router.post(
  '/enquiries',
  optionalAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('contactNo').trim().notEmpty().withMessage('Contact number is required'),
    body('productId').notEmpty().withMessage('Product ID is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, contactNo, requirement, productId } = req.body;

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const enquiry = await Enquiry.create({
        user: req.user?._id,
        product: productId,
        name,
        contactNo,
        requirement,
      });

      // Log activity if user is authenticated
      if (req.user) {
        await UserActivity.create({
          user: req.user._id,
          action: 'enquiry',
          product: productId,
          page: `/product/${product.slug}`,
        });
      }

      // Build WhatsApp redirect URL (number is hidden from frontend)
      const waNumber = process.env.WHATSAPP_NUMBER;
      const message = encodeURIComponent(
        `Hi, I'm interested in ${product.name} (ID: ${product.productId}).${requirement ? ` Requirement: ${requirement}` : ''}`
      );
      const whatsappUrl = `https://wa.me/${waNumber}?text=${message}`;

      res.status(201).json({ enquiry, whatsappUrl });
    } catch (error) {
      console.error('Enquiry error:', error);
      res.status(500).json({ error: 'Failed to submit enquiry' });
    }
  }
);

// List enquiries (admin)
router.get('/enquiries', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .populate('user', 'name email')
        .populate('product', 'name productId images price')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Enquiry.countDocuments(filter),
    ]);

    res.json({
      enquiries,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
});

// Update enquiry status (admin)
router.put('/enquiries/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('product', 'name productId');
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });
    res.json({ enquiry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update enquiry' });
  }
});

// ═══════════════════════════════════════════════════════════
//  CART
// ═══════════════════════════════════════════════════════════

// Get user's cart
router.get('/cart', authenticate, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product',
      'name productId price originalPrice images slug stock isActive'
    );
    if (!cart) {
      cart = { items: [] };
    }
    res.json({ cart });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add to cart
router.post(
  '/cart',
  authenticate,
  [body('productId').notEmpty(), body('quantity').optional().isInt({ min: 1, max: 99 })],
  validate,
  async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ error: 'Product not found' });
      }

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
      }

      // Check if product already in cart
      const existingItem = cart.items.find((item) => item.product.toString() === productId);
      if (existingItem) {
        existingItem.quantity = Math.min(existingItem.quantity + quantity, 99);
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();

      // Log activity
      await UserActivity.create({
        user: req.user._id,
        action: 'cart_add',
        product: productId,
      });

      // Populate and return
      cart = await Cart.findById(cart._id).populate(
        'items.product',
        'name productId price originalPrice images slug'
      );

      res.json({ cart });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add to cart' });
    }
  }
);

// Update cart item quantity
router.put('/cart/:itemId', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found in cart' });

    item.quantity = quantity;
    await cart.save();

    const populated = await Cart.findById(cart._id).populate(
      'items.product',
      'name productId price originalPrice images slug'
    );

    res.json({ cart: populated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove from cart
router.delete('/cart/:itemId', authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();

    const populated = await Cart.findById(cart._id).populate(
      'items.product',
      'name productId price originalPrice images slug'
    );

    res.json({ cart: populated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// ═══════════════════════════════════════════════════════════
//  ADS
// ═══════════════════════════════════════════════════════════

// Get active ads by placement
router.get('/ads/active', async (req, res) => {
  try {
    const { placement } = req.query;
    const filter = { isActive: true };
    if (placement) filter.placement = placement;

    // Check date range
    const now = new Date();
    filter.$or = [
      { startDate: null, endDate: null },
      { startDate: { $lte: now }, endDate: null },
      { startDate: null, endDate: { $gte: now } },
      { startDate: { $lte: now }, endDate: { $gte: now } },
    ];

    const ads = await Ad.find(filter).sort('-createdAt');

    // Increment impressions
    const adIds = ads.map((ad) => ad._id);
    if (adIds.length > 0) {
      await Ad.updateMany({ _id: { $in: adIds } }, { $inc: { impressions: 1 } });
    }

    res.json({ ads });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

// Track ad click
router.post('/ads/:id/click', async (req, res) => {
  try {
    await Ad.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ message: 'Click tracked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track click' });
  }
});

// Create ad (admin)
router.post('/ads', authenticate, requireAdmin, async (req, res) => {
  try {
    const ad = await Ad.create(req.body);
    res.status(201).json({ ad });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ad' });
  }
});

// List all ads (admin)
router.get('/ads', authenticate, requireAdmin, async (req, res) => {
  try {
    const ads = await Ad.find().sort('-createdAt');
    res.json({ ads });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

// Update ad (admin)
router.put('/ads/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    res.json({ ad });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ad' });
  }
});

// Delete ad (admin)
router.delete('/ads/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) return res.status(404).json({ error: 'Ad not found' });

    // Delete image from R2 if exists
    if (ad.image?.key) {
      await deleteFromR2(ad.image.key).catch(() => {});
    }

    res.json({ message: 'Ad deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ad' });
  }
});

// ═══════════════════════════════════════════════════════════
//  USERS & ACTIVITY (Admin)
// ═══════════════════════════════════════════════════════════

// List all users (admin)
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('lastVisitedProduct', 'name productId slug')
        .sort('-lastActive')
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user detail with activity log (admin)
router.get('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('lastVisitedProduct', 'name productId slug');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const activities = await UserActivity.find({ user: req.params.id })
      .populate('product', 'name productId')
      .sort('-timestamp')
      .limit(100);

    res.json({ user, activities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Log user activity (authenticated)
router.post('/activity', authenticate, trackActivity, async (req, res) => {
  try {
    const { action, page, productId, duration } = req.body;

    const activityData = {
      user: req.user._id,
      action: action || 'page_view',
      page,
      duration: duration || 0,
    };

    if (productId) {
      activityData.product = productId;
    }

    await UserActivity.create(activityData);

    // Update user tracking fields
    const updateFields = { lastActive: new Date(), lastVisitedPage: page };
    if (productId) updateFields.lastVisitedProduct = productId;
    if (duration) updateFields.$inc = { totalWatchTime: duration };

    if (duration) {
      await User.findByIdAndUpdate(req.user._id, {
        lastActive: new Date(),
        lastVisitedPage: page,
        ...(productId && { lastVisitedProduct: productId }),
        $inc: { totalWatchTime: duration },
      });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        lastActive: new Date(),
        lastVisitedPage: page,
        ...(productId && { lastVisitedProduct: productId }),
      });
    }

    res.json({ message: 'Activity logged' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

// ═══════════════════════════════════════════════════════════
//  UPLOAD (Admin — Cloudflare R2)
// ═══════════════════════════════════════════════════════════

// Upload image(s)
router.post('/upload', authenticate, requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const folder = req.body.folder || 'products';
    const results = [];

    for (const file of req.files) {
      const result = await uploadToR2(file.buffer, file.originalname, file.mimetype, folder);
      results.push(result);
    }

    res.json({ images: results });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Delete image
router.delete(['/upload', '/upload/{*key}'], authenticate, requireAdmin, async (req, res) => {
  try {
    const key = req.params.key || req.query.key || req.body.key;
    if (!key) {
      return res.status(400).json({ error: 'Image key is required' });
    }
    await deleteFromR2(key);
    res.json({ message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// ═══════════════════════════════════════════════════════════
//  HEALTH CHECK
// ═══════════════════════════════════════════════════════════

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
