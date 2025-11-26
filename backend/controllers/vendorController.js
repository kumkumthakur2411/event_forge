const Event = require('../models/Event');
const Quotation = require('../models/Quotation');
const EventImage = require('../models/EventImage');

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

exports.updateProfile = async (req, res) => {
  const user = req.user;
  user.profile = { ...user.profile, ...req.body };
  user.profileComplete = Boolean(user.profile.name && user.profile.phone && user.profile.company);
  
  if (req.files) {
    const photos = req.files.map(file => `/uploads/${file.filename}`);
    user.photos = user.photos.concat(photos);
  }

  await user.save();
  res.json({ message: 'Profile updated', user });
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
