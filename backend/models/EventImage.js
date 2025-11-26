const mongoose = require('mongoose');

const EventImageSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: { type: String, required: true },
  altText: { type: String },
  caption: { type: String },
  approved: { type: Boolean, default: false },
  forLanding: { type: Boolean, default: false }, // admin can mark whether approved image should appear on landing
}, { timestamps: true });

module.exports = mongoose.model('EventImage', EventImageSchema);
