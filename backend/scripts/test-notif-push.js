const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/event_forge');
    
    // Create a test user
    const user = await User.create({
      name: 'Test User',
      email: `test${Date.now()}@test.com`,
      password: 'hashedpass',
      role: 'client',
      status: 'approved'
    });
    
    console.log('Created user:', user._id);
    console.log('Initial notifications:', user.notifications);
    
    // Try to push a notification
    const notif = {
      message: 'Test notification',
      read: false,
      link: '/test',
      type: 'test',
      createdAt: new Date()
    };
    
    console.log('\nPushing notification:', JSON.stringify(notif));
    
    const updated = await User.findByIdAndUpdate(
      user._id,
      { $push: { notifications: notif } },
      { new: true }
    );
    
    console.log('\nAfter push:');
    console.log('Updated user notifications count:', updated.notifications.length);
    console.log('Updated user notifications:', JSON.stringify(updated.notifications, null, 2));
    
    // Direct query to confirm
    const direct = await User.findById(user._id);
    console.log('\nDirect query:');
    console.log('Notifications count:', direct.notifications.length);
    console.log('Notifications:', JSON.stringify(direct.notifications, null, 2));
    
    // Cleanup
    await User.deleteOne({ _id: user._id });
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (e) {
    console.error('ERROR:', e.message);
    console.error(e);
    process.exit(1);
  }
})();
