require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const email = process.argv[2] || 'admin@computermatch.in';
const password = process.argv[3] || 'Admin@123';
const name = process.argv[4] || 'Admin';

async function createOrUpdateAdmin() {
  try {
    console.log('[Admin Setup] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Admin Setup] Connected to MongoDB');

    let user = await User.findOne({ email });

    if (user) {
      console.log(`[Admin Setup] Existing user found with email: ${email}`);
      user.password = password;
      user.role = 'admin';
      user.isVerified = true;
      await user.save();
      console.log(`[Admin Setup] Successfully updated user to ADMIN with new password!`);
    } else {
      user = await User.create({
        name,
        email,
        password,
        role: 'admin',
        isVerified: true,
      });
      console.log(`[Admin Setup] Successfully created new ADMIN account!`);
    }

    console.log('\n======================================');
    console.log('       ADMIN CREDENTIALS:');
    console.log('======================================');
    console.log(` Email:    ${email}`);
    console.log(` Password: ${password}`);
    console.log(` Role:     admin`);
    console.log('======================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Admin Setup Error]:', error.message);
    process.exit(1);
  }
}

createOrUpdateAdmin();
