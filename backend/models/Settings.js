const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Event Forge' },
  defaultEventApproval: { type: String, enum: ['pending', 'autoApprove'], default: 'pending' },
  defaultTestimonialDisplay: { type: Boolean, default: false },
  defaultUserRole: { type: String, enum: ['client', 'vendor'], default: 'client' },
  // contact details for site/admin
  adminEmail: { type: String, default: '' },
  adminPhone: { type: String, default: '' },
  notifyOnNewRegistration: { type: Boolean, default: true },
  itemsPerPage: { type: Number, default: 10 },
  quickActionsEnabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

// single document storage - helpers in controllers will upsert
module.exports = mongoose.model('Settings', SettingsSchema);
