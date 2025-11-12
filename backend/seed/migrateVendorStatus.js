require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Quotation = require('../models/Quotation');
const Event = require('../models/Event');

async function migrate() {
  await connectDB();
  console.log('Starting migration...');

  try {
    // Update all quotations with status 'approved' to have vendorStatus='assigned' if not already set
    const result = await Quotation.updateMany(
      { status: 'approved', vendorStatus: { $in: [null, undefined, 'none'] } },
      { $set: { vendorStatus: 'assigned' } }
    );
    console.log(`Updated ${result.modifiedCount} quotations to vendorStatus='assigned'`);

    // Also set vendorStatus to 'none' for pending quotations that don't have it
    const result2 = await Quotation.updateMany(
      { status: 'pending', vendorStatus: null },
      { $set: { vendorStatus: 'none' } }
    );
    console.log(`Updated ${result2.modifiedCount} pending quotations to vendorStatus='none'`);

    // Verify
    const total = await Quotation.countDocuments();
    const withStatus = await Quotation.countDocuments({ vendorStatus: { $ne: null } });
    console.log(`Total quotations: ${total}, With vendorStatus: ${withStatus}`);

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
