const User = require('../models/User');
const Event = require('../models/Event');
const Quotation = require('../models/Quotation');

exports.getAllUsers = async (req, res) => {
  const { role, q } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) filter.$or = [ { name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') } ];
  const users = await User.find(filter).select('-password');
  res.json(users);
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
  res.json({ message: `Quotation ${quote.status}` });
};
