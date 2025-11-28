const Event = require('../models/Event');
const Quotation = require('../models/Quotation');
const EventImage = require('../models/EventImage');
const User = require('../models/User');

exports.availableEvents = async (req, res) => {
  // vendors see approved events
  // populate vendorInterests so frontend can determine if the current vendor already sent interest
  const events = await Event.find({ status: 'approved' })
    .populate('postedBy', 'name email')
    .populate({ path: 'vendorInterests', populate: { path: 'vendor', select: 'name email' } })
    .populate('assignedVendors', 'name email');
  res.json(events);
};

exports.sendInterest = async (req, res) => {
  try {
    const { eventId, message } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    // prevent duplicate interest from same vendor for the same event
    const existing = await Quotation.findOne({ vendor: req.user._id, event: event._id });
    if (existing) return res.status(400).json({ message: 'You have already sent interest for this event' });
    // create quotation
    const q = await Quotation.create({ vendor: req.user._id, event: event._id, message, status: 'pending', vendorStatus: 'none' });
    event.vendorInterests.push(q._id);
    await event.save();
    // Interest recorded (notification functionality removed)
    res.status(201).json({ message: 'Interest sent to admin', quotation: q });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.revokeInterest = async (req, res) => {
  try {
    const { eventId } = req.params;
    const quote = await Quotation.findOne({ vendor: req.user._id, event: eventId });
    if (!quote) return res.status(404).json({ message: 'No interest found to revoke' });
    // remove quotation reference from event
    const event = await Event.findById(eventId);
    if (event) {
      event.vendorInterests = event.vendorInterests.filter(qid => qid.toString() !== quote._id.toString());
      await event.save();
    }
    await quote.remove();
    res.json({ message: 'Interest revoked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// vendor updates their assigned quotation status (accept / complete)
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { action } = req.body; // 'accept' | 'complete'
    const quote = await Quotation.findOne({ vendor: req.user._id, event: eventId, status: 'approved' });
    if (!quote) return res.status(404).json({ message: 'Assigned quotation not found' });
    if (action === 'accept') {
      quote.vendorStatus = 'accepted';
    } else if (action === 'complete') {
      quote.vendorStatus = 'completed';
    } else if (action === 'deny' || action === 'reject') {
      // vendor denies the assignment: mark quotation and remove vendor from event.assignedVendors
      quote.vendorStatus = 'denied';
      const event = await Event.findById(eventId);
      if (event) {
        event.assignedVendors = event.assignedVendors.filter(v => String(v) !== String(req.user._id));
        await event.save();
      }
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
    await quote.save();
    // Notification functionality removed; return updated quotation
    res.json({ message: 'Status updated', quotation: quote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload photos related to an event (vendor can upload multiple photos)
exports.uploadEventPhotos = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });

    const imgs = [];
    for (const f of req.files) {
      const imageUrl = `/uploads/${f.filename}`;
      const img = await EventImage.create({ event: event._id, uploader: req.user._id, imageUrl, approved: false, forLanding: false });
      imgs.push(img);
    }
    res.status(201).json({ message: 'Photos uploaded (pending admin approval)', images: imgs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignedEvents = async (req, res) => {
  try {
    // return events where this vendor is assigned
    // populate vendorInterests so vendor can see their quotation and vendorStatus
    const events = await Event.find({ assignedVendors: req.user._id })
      .populate('postedBy', 'name email')
      .populate('assignedVendors', 'name email')
      .populate({ path: 'vendorInterests', populate: { path: 'vendor', select: 'name email' } });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// vendor deletes their own account
exports.deleteAccount = async (req, res) => {
  try {
    const u = req.user;
    // remove quotations
    await Quotation.deleteMany({ vendor: u._id });
    // remove vendor from events assigned lists
    await Event.updateMany({ assignedVendors: u._id }, { $pull: { assignedVendors: u._id } });
    // remove event images uploaded by vendor
    await EventImage.deleteMany({ uploader: u._id });
    await u.deleteOne();
    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get vendor profile without password
exports.getProfile = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id).select('-password');
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update vendor profile (name, email, phone, city, company info, bio, experience, profileImage)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phoneNo, city, companyName, companyEmail, companyPhone, bio, experience } = req.body;
    const vendor = await User.findById(req.user._id);
    
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    // Check if email is already taken by another vendor
    if (email && email !== vendor.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Update allowed fields
    if (name) vendor.name = name;
    if (email) vendor.email = email;
    if (phoneNo) vendor.phoneNo = phoneNo;
    if (city) vendor.city = city;
    if (companyName) vendor.companyName = companyName;
    if (companyEmail) vendor.companyEmail = companyEmail;
    if (companyPhone) vendor.companyPhone = companyPhone;
    if (bio) vendor.bio = bio;
    if (experience) vendor.experience = experience;
    
    // Handle profileImage file upload
    if (req.file) {
      vendor.profileImage = `/uploads/${req.file.filename}`;
    }
    
    await vendor.save();
    const safe = vendor.toObject();
    delete safe.password;
    res.json({ message: 'Profile updated', vendor: safe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change vendor password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    // Verify current password
    const isMatch = await vendor.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    
    // Update password
    vendor.password = newPassword;
    await vendor.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload vendor gallery photos
exports.uploadVendorPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const vendor = await User.findById(req.user._id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    // Add uploaded photos to vendorPhotos array
    for (const file of req.files) {
      const photoUrl = `/uploads/${file.filename}`;
      vendor.vendorPhotos.push(photoUrl);
    }
    
    await vendor.save();
    res.status(201).json({ message: 'Photos uploaded successfully', vendorPhotos: vendor.vendorPhotos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a vendor photo
exports.deleteVendorPhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body;
    const vendor = await User.findById(req.user._id);
    
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    vendor.vendorPhotos = vendor.vendorPhotos.filter(p => p !== photoUrl);
    await vendor.save();
    
    res.json({ message: 'Photo deleted', vendorPhotos: vendor.vendorPhotos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get public vendor profile (no auth required)
exports.getPublicProfile = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await User.findById(vendorId).select('-password -status');
    
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    if (vendor.role !== 'vendor') return res.status(404).json({ message: 'Not a vendor' });
    
    res.json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
