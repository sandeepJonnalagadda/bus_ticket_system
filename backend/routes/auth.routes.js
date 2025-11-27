const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// User Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: generateToken(user._id) });
});

// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({ token: generateToken(user._id) });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  // On first run, create a default admin if one doesn't exist
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0 && email === 'admin@smartbus.app' && password === 'admin123') {
      await Admin.create({ name: 'Admin', email, password });
  }
  
  const admin = await Admin.findOne({ email });
  if (admin && (await bcrypt.compare(password, admin.password))) {
    res.json({ token: generateToken(admin._id) });
  } else {
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
});

module.exports = router;