// Replace the contents of backend/routes/users.routes.js with this.

const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { protect, adminProtect } = require('../middleware/auth.middleware');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    res.json(req.user);
});

// @desc    Update user password
// @route   PUT /api/users/profile/password
// @access  Private
router.put('/profile/password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);

    if (user && (await bcrypt.compare(currentPassword, user.password))) {
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(401).json({ message: 'Current password is incorrect' });
    }
});


// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', adminProtect, async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

module.exports = router;