// Replace the entire contents of backend/middleware/auth.middleware.js with this code.

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');

const protect = async (req, res, next) => {
  console.log('\n--- "protect" MIDDLEWARE TRIGGERED ---');
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      console.log('1. Authorization header found:', req.headers.authorization);
      
      token = req.headers.authorization.split(' ')[1];
      console.log('2. Token extracted successfully.');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('3. Token verified successfully. Decoded payload:', decoded);

      req.user = await User.findById(decoded.id).select('-password');
      console.log('4. User search result from DB:', req.user ? `Found user with ID: ${req.user._id}` : 'User NOT Found');

      if (req.user) {
        console.log('5. SUCCESS: User is valid. Granting access to the next step.');
        next();
      } else {
        console.log('5. FAILED: User not found for the ID in the token.');
        res.status(401).json({ message: 'Not authorized, user not found' });
      }

    } catch (error) {
      console.error('5. FAILED in CATCH block. Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log('FAILED: No "Authorization" header found.');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};


const adminProtect = async (req, res, next) => {
  // This function remains the same as it is working correctly.
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (req.admin) {
        next();
      } else {
        throw new Error('Admin not found');
      }
    } catch (error) {
      res.status(401).json({ message: 'Admin not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Admin not authorized, no token' });
  }
};

module.exports = { protect, adminProtect };