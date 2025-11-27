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
    
    // Delete old test categories
    await Category.deleteMany({});
    
    // Create test categories with actual uploaded image filenames
    const cats = await Category.insertMany([
      {
        name: 'Wedding',
        description: 'Wedding decoration and catering services',
        imageUrl: '/uploads/images-1764249527141.jpeg',
        altText: 'Wedding decorations',
        images: [
          { url: '/uploads/images-1764249527141.jpeg', altText: 'Wedding decor 1', uploadedAt: new Date() },
          { url: '/uploads/images-1764249689312.jpeg', altText: 'Wedding decor 2', uploadedAt: new Date() }
        ]
      },
      {
        name: 'Birthday',
        description: 'Birthday parties and celebrations',
        imageUrl: '/uploads/images-1764249705061.jpeg',
        altText: 'Birthday celebration',
        images: [
          { url: '/uploads/images-1764249705061.jpeg', altText: 'Birthday decor', uploadedAt: new Date() }
        ]
      },
      {
        name: 'Corporate',
        description: 'Corporate events and conferences',
        imageUrl: '/uploads/photos-1763843068280.jpg',
        altText: 'Corporate event',
        images: [
          { url: '/uploads/photos-1763843068280.jpg', altText: 'Corporate setup 1', uploadedAt: new Date() },
          { url: '/uploads/photos-1763843088961.jpeg', altText: 'Corporate setup 2', uploadedAt: new Date() }
        ]
      }
    ]);
    
    console.log('✓ Categories created:', cats.length);
    console.log('✓ Sample category:', JSON.stringify(cats[0], null, 2));
    process.exit(0);
  } catch (e) {
    console.error('✗ Error:', e.message);
    process.exit(1);
  }
})();
