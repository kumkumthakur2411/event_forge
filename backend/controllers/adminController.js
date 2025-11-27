const User = require('../models/User');
const Event = require('../models/Event');
const Quotation = require('../models/Quotation');
const Category = require('../models/Category');
const Testimonial = require('../models/Testimonial');
const WebImage = require('../models/WebImage');
const EventImage = require('../models/EventImage');

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
    const { name, description,longDescription, altText } = req.body;
    const images = [];
    
    if (req.file) {
      images.push({ url: `/uploads/${req.file.filename}`, altText: altText || '', uploadedAt: new Date() });
    }

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const existing = await Category.findOne({ name });

    // If category exists, update image & alt text instead of throwing error
    if (existing) {
      if (images.length > 0) {
        existing.images = images;
        existing.imageUrl = images[0].url;
      }
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
      longDescription,
      imageUrl: images.length > 0 ? images[0].url : undefined,
      altText,
      images
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
    const { name, description,longDescription ,altText } = req.body;
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    if (name) cat.name = name;
    if (description) cat.description = description;
    if (altText) cat.altText = altText;
    if (longDescription) cat.longDescription = longDescription;


    // handle single image upload - replaces current image
    if (req.file) {
      const url = `/uploads/${req.file.filename}`;
      cat.images = [{ url, altText: altText || '', uploadedAt: new Date() }];
      cat.imageUrl = url;
    }

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

// add images to category (multiple)
exports.addCategoryImages = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    cat.images = cat.images || [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(f => cat.images.push({ url: `/uploads/${f.filename}`, altText: req.body.altText || '', uploadedAt: new Date() }));
    }
    await cat.save();
    res.json({ message: 'Images added', category: cat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// remove single category image by url
exports.deleteCategoryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    cat.images = (cat.images || []).filter(i => i.url !== imageUrl);
    // if primary image was removed, update imageUrl
    if (cat.imageUrl === imageUrl) cat.imageUrl = cat.images.length > 0 ? cat.images[0].url : undefined;
    await cat.save();
    res.json({ message: 'Image removed', category: cat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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

// delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Delete all quotations for this event
    await Quotation.deleteMany({ event: id });
    
    // Delete the event
    await Event.findByIdAndDelete(id);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// delete a user (admin)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const u = await User.findById(id);
    if(!u) return res.status(404).json({ message: 'User not found' });

    // remove references: if client, remove their events; if vendor, remove their quotations and remove from assigned lists
    if(u.role === 'client'){
      const events = await Event.find({ postedBy: u._id });
      for(const ev of events){
        // delete related quotations
        await Quotation.deleteMany({ event: ev._id });
        await EventImage.deleteMany({ event: ev._id });
        await ev.deleteOne();
      }
    } else if (u.role === 'vendor'){
      await Quotation.deleteMany({ vendor: u._id });
      // remove vendor from assignedVendors in events
      await Event.updateMany({ assignedVendors: u._id }, { $pull: { assignedVendors: u._id } });
    }

    // remove uploaded images by this user
    await EventImage.deleteMany({ uploader: u._id });

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// set payment flag on a quotation (admin)
exports.setPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params; // quotation id
    const { paid } = req.body;
    const q = await Quotation.findById(id);
    if(!q) return res.status(404).json({ message: 'Quotation not found' });
    q.paid = Boolean(paid);
    await q.save();
    res.json({ message: 'Payment status updated', quotation: q });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
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
    const { section, altText } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;

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

// Update admin's own profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name } = req.body;
    if (name) user.name = name;
    // merge profile object
    if (req.body.profile) {
      try {
        const p = typeof req.body.profile === 'string' ? JSON.parse(req.body.profile) : req.body.profile;
        user.profile = { ...(user.profile || {}), ...p };
      } catch (e) {
        // ignore parse errors and treat as plain object
        user.profile = { ...(user.profile || {}), ...req.body.profile };
      }
    }

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();
    const safe = user.toObject();
    delete safe.password;
    res.json({ message: 'Profile updated', user: safe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change admin password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'currentPassword and newPassword required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Event images (gallery) management
exports.createEventImage = async (req, res) => {
  try {
    const { event, altText, caption, forLanding } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    if (!imageUrl) return res.status(400).json({ message: 'image required' });
    const img = await EventImage.create({ event: event || null, uploader: req.user._id, imageUrl, altText, caption, approved: Boolean(req.body.approved), forLanding: Boolean(forLanding) });
    res.status(201).json({ message: 'Event image uploaded', image: img });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listEventImages = async (req, res) => {
  try {
    // Filters and pagination
    const { status, uploader, event, page = 1, limit = 10, q } = req.query;
    const filter = {};
    if (status === 'approved') filter.approved = true;
    if (status === 'pending') filter.approved = false;
    if (event) filter.event = event;

    // if uploader provided as email, resolve to id
    if (uploader) {
      const byEmail = await User.findOne({ email: uploader });
      if (byEmail) filter.uploader = byEmail._id;
      else if (/^[0-9a-fA-F]{24}$/.test(uploader)) filter.uploader = uploader; // assume id
    }

    if (q) {
      // simple text search on caption or altText
      filter.$or = [ { caption: new RegExp(q, 'i') }, { altText: new RegExp(q, 'i') } ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const lim = Math.min(parseInt(limit, 10) || 10, 100);

    const total = await EventImage.countDocuments(filter);
    const images = await EventImage.find(filter)
      .populate('event', 'title')
      .populate('uploader', 'name email')
      .sort('-createdAt')
      .skip((pageNum - 1) * lim)
      .limit(lim);

    res.json({ images, total, page: pageNum, pages: Math.ceil(total / lim) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin dashboard stats
exports.getStats = async (req, res) => {
  try {
    const vendorsCount = await User.countDocuments({ role: 'vendor' });
    const clientsCount = await User.countDocuments({ role: 'client' });
    const completedEvents = await Event.countDocuments({ status: 'approved' });
    const pendingEvents = await Event.countDocuments({ status: 'pending' });
    res.json({ vendorsCount, clientsCount, completedEvents, pendingEvents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// list quotations with filters and pagination for admin payments view
exports.listQuotations = async (req, res) => {
  try {
    const { status, vendor, event, page = 1, limit = 20, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (event) filter.event = event;
    if (vendor) {
      const byEmail = await User.findOne({ email: vendor });
      if (byEmail) filter.vendor = byEmail._id;
      else if (/^[0-9a-fA-F]{24}$/.test(vendor)) filter.vendor = vendor;
    }
    if (q) filter.$or = [{ message: new RegExp(q, 'i') }];

    const pageNum = parseInt(page, 10) || 1;
    const lim = Math.min(parseInt(limit, 10) || 20, 200);
    const total = await Quotation.countDocuments(filter);
    const quotes = await Quotation.find(filter)
      .populate('vendor', 'name email')
      .populate('event', 'title')
      .sort('-createdAt')
      .skip((pageNum - 1) * lim)
      .limit(lim);
    res.json({ quotations: quotes, total, page: pageNum, pages: Math.ceil(total / lim) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// bulk set payment status for multiple quotations
exports.bulkSetPayment = async (req, res) => {
  try {
    const { ids, paid } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'ids required' });
    const result = await Quotation.updateMany({ _id: { $in: ids } }, { $set: { paid: Boolean(paid) } });
    res.json({ message: 'Updated', modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveEventImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve, forLanding } = req.body;
    const img = await EventImage.findById(id);
    if (!img) return res.status(404).json({ message: 'Image not found' });
    if (typeof approve !== 'undefined') img.approved = Boolean(approve);
    if (typeof forLanding !== 'undefined') img.forLanding = Boolean(forLanding);
    await img.save();
    res.json({ message: 'Image updated', image: img });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEventImage = async (req, res) => {
  try {
    const { id } = req.params;
    await EventImage.findByIdAndDelete(id);
    res.json({ message: 'Event image deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark quotation (vendor payment for event) as paid
exports.markQuotationPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByIdAndUpdate(
      id,
      { paid: true },
      { new: true }
    ).populate('vendor event');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json({ message: 'Vendor marked as paid', quotation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark quotation (vendor payment for event) as unpaid
exports.markQuotationUnpaid = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByIdAndUpdate(
      id,
      { paid: false },
      { new: true }
    ).populate('vendor event');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json({ message: 'Vendor marked as unpaid', quotation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

