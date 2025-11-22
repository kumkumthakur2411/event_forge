const connectDB = require('../config/db');
const Testimonial = require('../models/Testimonial');

const seed = async () => {
  try {
    await connectDB();
    const count = await Testimonial.countDocuments();
    if (count > 0) {
      console.log(`Testimonials already present (${count}), skipping seed.`);
      process.exit(0);
    }

    const samples = [
      { name: 'Asha Kumar', role: 'Bride', message: 'Event Forge helped me find the perfect florist and caterer quickly!', avatar: '' },
      { name: 'Ravi Patel', role: 'Groom', message: 'Smooth experience and professional vendors. Highly recommended.', avatar: '' },
      { name: 'Neha Singh', role: 'Event Organizer', message: 'Great platform to discover reliable vendors for all budgets.', avatar: '' }
    ];

    await Testimonial.insertMany(samples);
    console.log('Inserted sample testimonials');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
