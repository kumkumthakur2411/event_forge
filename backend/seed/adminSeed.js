const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();
    const email = process.env.ADMIN_EMAIL || 'admin@admin.com';
    const password = process.env.ADMIN_PASSWORD || 'admin@admin';
    let admin = await User.findOne({ email });
    if (admin) {
      console.log('Admin already exists');
      process.exit(0);
    }
    admin = await User.create({ name: 'Administrator', email, password, role: 'admin', status: 'approved', profileComplete: true });
    console.log('Admin created:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
