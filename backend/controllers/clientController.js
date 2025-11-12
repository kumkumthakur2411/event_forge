const Event = require('../models/Event');

exports.postEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });
    const event = await Event.create({ title, description, date, location, postedBy: req.user._id, status: 'pending' });
    res.status(201).json({ message: 'Event submitted for admin approval', event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.myEvents = async (req, res) => {
  // Return events posted by this client. For each event, only include vendors who have accepted/completed the assignment.
  const events = await Event.find({ postedBy: req.user._id });
  const Quotation = require('../models/Quotation');
  const results = [];
  for (const ev of events) {
    // find quotations for this event where vendorStatus indicates vendor confirmed (accepted/completed)
    const quotes = await Quotation.find({ event: ev._id, status: 'approved', vendorStatus: { $in: ['accepted', 'completed'] } }).populate('vendor', 'name email');
    const confirmedVendors = quotes.map(q => q.vendor);
    const evObj = ev.toObject();
    evObj.assignedVendors = confirmedVendors;
    results.push(evObj);
  }
  res.json(results);
};

exports.updateProfile = async (req, res) => {
  const user = req.user;
  user.profile = { ...user.profile, ...req.body };
  // basic heuristic: if name and phone exist then profile complete
  user.profileComplete = Boolean(user.profile.name && user.profile.phone);
  await user.save();
  res.json({ message: 'Profile updated', profile: user.profile, profileComplete: user.profileComplete });
};
