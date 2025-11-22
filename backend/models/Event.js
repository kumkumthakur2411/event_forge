const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  location: { type: String },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
  vendorInterests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' }],
  assignedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// pendingEdits stores admin-proposed edits that must be applied to become live
EventSchema.add({
  pendingEdits: { type: mongoose.Schema.Types.Mixed, default: null }
});

module.exports = mongoose.model('Event', EventSchema);
