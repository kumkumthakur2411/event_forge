const mongoose = require('mongoose');
require('dotenv').config();

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
  altText: String,
  images: [{ url: String, altText: String, uploadedAt: Date }]
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event_forge');
    const categories = await Category.find().limit(3);
    console.log('Categories found:', JSON.stringify(categories, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
