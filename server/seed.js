require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Category = require('./models/Category');

const categories = [
  { name: 'New Laptops', condition: 'new', type: 'laptop', description: 'Brand new laptops from top brands', order: 1 },
  { name: 'New Computers', condition: 'new', type: 'computer', description: 'Brand new desktop computers and workstations', order: 2 },
  { name: 'New Accessories', condition: 'new', type: 'accessory', description: 'Brand new computer accessories and peripherals', order: 3 },
  { name: 'Refurbished Laptops', condition: 'refurbished', type: 'laptop', description: 'Quality refurbished laptops at great prices', order: 4 },
  { name: 'Refurbished Computers', condition: 'refurbished', type: 'computer', description: 'Refurbished desktop computers and workstations', order: 5 },
  { name: 'Refurbished Accessories', condition: 'refurbished', type: 'accessory', description: 'Refurbished accessories at affordable prices', order: 6 },
  { name: 'Refurbished Mac PCs', condition: 'refurbished', type: 'mac', description: 'Certified refurbished Apple Mac computers', order: 7 },
];

const seedCategories = async () => {
  try {
    await connectDB();
    console.log('[Seed] Seeding categories...\n');

    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (existing) {
        console.log(`  [Skip] Skipped: "${cat.name}" (already exists)`);
      } else {
        await Category.create(cat);
        console.log(`  [Done] Created: "${cat.name}"`);
      }
    }

    console.log('\n[Seed] Category seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('[Error] Seeding failed:', error);
    process.exit(1);
  }
};

seedCategories();
