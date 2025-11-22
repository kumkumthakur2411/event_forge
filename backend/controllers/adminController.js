const User = require('../models/User');
const Event = require('../models/Event');
const Quotation = require('../models/Quotation');
const Category = require('../models/Category');
const Testimonial = require('../models/Testimonial');
const WebImage = require('../models/WebImage');
//get all user with sorting
exports.getAllUsers = async (req, res) => {
  const { role, q, category  } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) filter.$or = [ { name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') } ];
  if (category) filter.categories = category;
  
  const users = await User.find(filter).select('-password').populate('categories', 'name');
  res.json(users);
};
//create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl, altText } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const existing = await Category.findOne({ name });

    // If category exists, update image & alt text instead of throwing error
    if (existing) {
      existing.imageUrl = imageUrl || existing.imageUrl;
      existing.altText = altText || existing.altText;
      existing.updatedAt = new Date();
      await existing.save();

      return res.status(200).json({
        message: 'Category existed, image updated',
        category: existing,
      });
    }

    // Create new category
    const category = await Category.create({
      name,
      description,
      imageUrl,
      altText,
    });

    res.status(201).json(category);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
//get category
exports.getCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort("name");
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
//update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, altText } = req.body;

    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    if (name) cat.name = name;
    if (description) cat.description = description;
    if (imageUrl) cat.imageUrl = imageUrl;
    if (altText) cat.altText = altText;

    await cat.save();

    res.json({ message: 'Category updated', category: cat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
//delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const cat = await Category.findById(id);
    if (!cat) {
      return res.status(404).json({ message: "Category not found" });
    }

    await cat.deleteOne();

    // Also remove category from user documents
    await User.updateMany(
      { categories: id },
      { $pull: { categories: id } }
    );

    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateEvent = async (req, res) => {
  try{
    const { id } = req.params;
    const { title, description, date, location } = req.body;
    const event = await Event.findById(id);
    if(!event) return res.status(404).json({ message: 'Event not found' });
    // Save edits as pending; admin must apply pending edits to make them live
    event.pendingEdits = { title, description, date, location, editedBy: req.user._id, editedAt: new Date() };
    await event.save();
    res.json({ message: 'Event edits saved as pending', pendingEdits: event.pendingEdits });
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
//
exports.applyPendingEdits = async (req, res) => {
  try{
    const { id } = req.params;
    const event = await Event.findById(id);
    if(!event) return res.status(404).json({ message: 'Event not found' });
    if(!event.pendingEdits) return res.status(400).json({ message: 'No pending edits to apply' });
    const p = event.pendingEdits;
    if(p.title) event.title = p.title;
    if(p.description) event.description = p.description;
    if(p.date) event.date = p.date;
    if(p.location) event.location = p.location;
    event.pendingEdits = null;
    await event.save();
    // Pending edits applied (notifications and optional emails removed)
    res.json({ message: 'Pending edits applied', event });
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
//discard pending edit
exports.discardPendingEdits = async (req, res) => {
  try{
    const { id } = req.params;
    const event = await Event.findById(id);
    if(!event) return res.status(404).json({ message: 'Event not found' });
    event.pendingEdits = null;
    await event.save();
    res.json({ message: 'Pending edits discarded' });
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveUser = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'deny'
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.status = action === 'approve' ? 'approved' : 'denied';
  await user.save();
  res.json({ message: `User ${user.status}` });
};
exports.getUser = async (req, res) => {
  try{
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if(!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getAllEvents = async (req, res) => {
  const events = await Event.find().populate('postedBy', 'name email role').populate({ path: 'vendorInterests', populate: { path: 'vendor', select: 'name email' } }).populate('assignedVendors', 'name email');
  res.json(events);
};
exports.getEvent = async (req, res) => {
  const event = await Event.findById(req.params.id).populate('postedBy', 'name email').populate({ path: 'vendorInterests', populate: { path: 'vendor', select: 'name email' } }).populate('assignedVendors', 'name email');
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
};
exports.approveEvent = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  event.status = action === 'approve' ? 'approved' : 'denied';
  await event.save();
  // Event approval processed (notification functionality removed)
  res.json({ message: `Event ${event.status}` });
};
exports.approveQuotation = async (req, res) => {
  const { id } = req.params; // quotation id
  const { action } = req.body;
  const quote = await Quotation.findById(id).populate('vendor event');
  if (!quote) return res.status(404).json({ message: 'Quotation not found' });
  quote.status = action === 'approve' ? 'approved' : 'denied';
  // when admin approves the quotation, mark it as assigned for vendor
  if (action === 'approve') quote.vendorStatus = 'assigned';
  await quote.save();
  if (action === 'approve') {
    // assign vendor to event
    const event = await Event.findById(quote.event._id);
    if (event && !event.assignedVendors.includes(quote.vendor._id)) {
      event.assignedVendors.push(quote.vendor._id);
      await event.save();
    }
  }
  // Notifications removed: simply return status
  res.json({ message: `Quotation ${quote.status}` });
};
exports.getPendingTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ approved: false }).sort('-createdAt');
    res.json(testimonials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.approveTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndUpdate(id, { approved: true }, { new: true });
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
    res.json({ message: 'Testimonial approved', testimonial });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.rejectTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    await Testimonial.findByIdAndDelete(id);
    res.json({ message: 'Testimonial rejected and deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.uploadImage = async (req, res) => {
  try {
    const { section, imageUrl, altText } = req.body;
    if (!section || !imageUrl) return res.status(400).json({ message: 'section and imageUrl required' });
    const existing = await WebImage.findOne({ section });
    if (existing) {
      existing.imageUrl = imageUrl;
      existing.altText = altText || existing.altText;
      existing.updatedAt = new Date();
      await existing.save();
      return res.json({ message: 'Image updated', image: existing });
    }
    const image = await WebImage.create({ section, imageUrl, altText });
    res.status(201).json({ message: 'Image uploaded', image });
  } catch (err) {
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
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    await WebImage.findByIdAndDelete(id);
    res.json({ message: 'Image deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
