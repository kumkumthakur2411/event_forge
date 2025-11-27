const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  longDescription: String,
  imageUrl: String,
  altText: String,
  images: [{ url: String, altText: String, uploadedAt: Date }]
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
