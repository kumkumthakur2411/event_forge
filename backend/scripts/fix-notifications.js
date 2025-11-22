const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/event_forge');
    const User = require('../models/User');
    
    // Ensure all users have notifications array initialized
    const result = await User.updateMany(
      { notifications: { $exists: false } },
      { $set: { notifications: [] } }
    );
    
    console.log('Updated', result.modifiedCount, 'documents');
    
    // Verify by checking a user
    const user = await User.findOne().limit(1);
    console.log('Sample user notifications:', user.notifications);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
