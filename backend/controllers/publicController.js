const User = require('../models/User');
const Event = require('../models/Event');
const Quotation = require('../models/Quotation');
const Testimonial = require('../models/Testimonial');
const WebImage = require('../models/WebImage');
const Category = require('../models/Category');
const EventImage = require('../models/EventImage');
const Settings = require('../models/Settings');

exports.listVendors = async (req, res) => {
  try{
    const vendors = await User.find({ role: 'vendor', status: 'approved' }).select('name email profile categories').populate('categories', 'name');
    res.json(vendors);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.searchVendors = async (req, res) => {
  try{
    const q = req.query.q || '';
    const regex = new RegExp(q, 'i');
    const vendors = await User.find({ role: 'vendor', status: 'approved', $or: [ { name: regex }, { email: regex }, { 'profile.company': regex } ] }).select('name email profile categories').populate('categories', 'name');
    res.json(vendors);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.completedEvents = async (req, res) => {
  try{
    // Events where at least one quotation has vendorStatus 'completed'
    const quotes = await Quotation.find({ vendorStatus: 'completed' }).select('event');
    const eventIds = [...new Set(quotes.map(q => q.event.toString()))];
    const events = await Event.find({ _id: { $in: eventIds } }).populate('postedBy', 'name email');
    res.json(events);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.testimonials = async (req, res) => {
  try{
    // support landing view (only testimonials marked for landing) and custom limits
    const landing = req.query.landing === 'true' || req.query.landing === '1';
    const limit = parseInt(req.query.limit, 10) || (landing ? 6 : 10);
    const filter = { approved: true };
    if (landing) filter.displayOnLanding = true;
    let items = await Testimonial.find(filter).sort('-createdAt').limit(limit);
    if(!items || items.length === 0){
      // fallback sample testimonials when DB empty
      items = [
        { name: 'Asha Kumar', role: 'Bride', message: 'Event Forge helped me find the perfect vendor quickly!', avatar: '' },
        { name: 'Ravi Patel', role: 'Groom', message: 'Smooth experience and professional vendors.', avatar: '' }
      ];
    }
    res.json(items);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getImages = async (req, res) => {
  try {
    const images = await WebImage.find().sort('displayOrder');
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getVendorsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    const vendors = await User.find({ 
      role: 'vendor', 
      status: 'approved', 
      categories: categoryId 
    }).select('name email profile categories');
    
    res.json({ category, vendors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.eventGallery = async (req, res) => {
  try {
    // return images approved for landing
    const images = await EventImage.find({ approved: true, forLanding: true }).sort('-createdAt').populate('uploader', 'name email').populate('event', 'title');
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Public site settings (only expose non-sensitive fields)
exports.getSettings = async (req, res) => {
  try {
    let s = await Settings.findOne();
    if (!s) {
      // return sensible defaults if not configured
      return res.json({ siteName: 'Event Forge', adminEmail: '', adminPhone: '' });
    }
    // Only send safe/public fields
    const out = {
      siteName: s.siteName || 'Event Forge',
      adminEmail: s.adminEmail || '',
      adminPhone: s.adminPhone || ''
    };
    res.json(out);
  } catch (err) {
    console.error('public.getSettings error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
