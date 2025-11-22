const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, categories } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'Please provide required fields' });
    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const userData = { name, email, password, role, status: role === 'admin' ? 'approved' : 'pending' };
    if (role === 'vendor' && Array.isArray(categories)) userData.categories = categories;
    const user = await User.create(userData);
    // Admin accounts created via seed should be approved. Regular registrations need admin approval.
    // Registration created (notification functionality removed)

    res.status(201).json({ message: 'Registration successful, pending admin approval', user: { id: user._id, email: user.email, role: user.role, status: user.status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    if (user.status !== 'approved') return res.status(403).json({ message: 'Account not approved by admin' });
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role, profileComplete: user.profileComplete } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
