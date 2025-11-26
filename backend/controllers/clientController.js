const Event = require('../models/Event');
const Testimonial = require('../models/Testimonial');
const EventImage = require('../models/EventImage');
const Quotation = require('../models/Quotation');

exports.postEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    const event = await Event.create({ title, description, date, location, postedBy: req.user._id, status: 'pending' });
    // Event submitted for admin approval (notification functionality removed)

    res.status(201).json({ message: 'Event submitted for admin approval', event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.myEvents = async (req, res) => {
  // Return events posted by this client. For each event, only include vendors who have accepted/completed the assignment.
  const events = await Event.find({ postedBy: req.user._id });
  const results = [];
  for (const ev of events) {
    // find quotations for this event where vendorStatus indicates vendor confirmed (accepted/completed)
    const quotes = await Quotation.find({ event: ev._id, status: 'approved', vendorStatus: { $in: ['accepted', 'completed'] } }).populate('vendor', 'name email');
    const evObj = ev.toObject();
    // include quotations (with vendor and paid status) so client can see payment state per vendor
    evObj.quotations = quotes;
    evObj.assignedVendors = quotes.map(q => q.vendor);
    results.push(evObj);
  }
  res.json(results);
};

exports.updateProfile = async (req, res) => {
  const user = req.user;
  user.profile = { ...user.profile, ...req.body };
  // basic heuristic: if name and phone exist then profile complete
  user.profileComplete = Boolean(user.profile.name && user.profile.phone);

  if (req.file) {
    user.profileImage = `/uploads/${req.file.filename}`;
  }

  await user.save();
  res.json({ message: 'Profile updated', user });
};

// Client uploads photos for their event
exports.uploadEventPhotos = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (String(event.postedBy) !== String(req.user._id)) return res.status(403).json({ message: 'Not allowed' });
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

exports.submitFeedback = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });
    const name = req.user.name || req.user.email || 'Client';
    const role = 'Client';
    const avatar = (req.user.profile && req.user.profile.avatar) ? req.user.profile.avatar : '';
    const t = await Testimonial.create({ name, role, message, avatar });
    res.status(201).json({ message: 'Thank you for your feedback', testimonial: t });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// client deletes their own account
exports.deleteAccount = async (req, res) => {
  try {
    const u = req.user;
    // delete events posted by client and related quotations and images
    const events = await Event.find({ postedBy: u._id });
    for(const ev of events){
      await Quotation.deleteMany({ event: ev._id });
      await EventImage.deleteMany({ event: ev._id });
      await ev.deleteOne();
    }
    await EventImage.deleteMany({ uploader: u._id });
    await u.deleteOne();
    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
