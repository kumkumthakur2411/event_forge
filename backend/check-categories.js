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
    const all = await Category.find();
    console.log('Total categories:', all.length);
    all.forEach((c, i) => {
      console.log(`\n${i+1}. ${c.name}`);
      console.log(`   - imageUrl: ${c.imageUrl}`);
      console.log(`   - images count: ${c.images ? c.images.length : 0}`);
      if (c.images && c.images.length > 0) {
        c.images.forEach((img, j) => {
          console.log(`     ${j+1}. ${img.url}`);
        });
      }
    });
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
