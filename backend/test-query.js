require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');
const Quotation = require('./models/Quotation');

(async () => {
  await connectDB();
  const events = await Event.find({ assignedVendors: { $exists: true, $not: { $size: 0 } } })
    .populate('postedBy', 'name email')
    .populate('assignedVendors', 'name email')
    .populate({ path: 'vendorInterests', populate: { path: 'vendor', select: 'name email' } })
    .limit(1);
  
  console.log('Sample event with assigned vendors:');
  console.log(JSON.stringify(events[0], null, 2));
  process.exit(0);
})();
