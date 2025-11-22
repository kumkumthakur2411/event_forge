const mongoose = require('mongoose');

const WebImageSchema = new mongoose.Schema({
  section: { type: String, required: true }, // e.g., 'hero', 'why-us', 'how-it-works', 'navbar-logo', 'footer'
  imageUrl: { type: String, required: true }, // URL or base64 or file path
  altText: { type: String },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WebImage', WebImageSchema);
