// Replace the entire contents of backend/routes/bookings.routes.js with this code.

const express = require('express');
const router = express.Router();
const Booking = require('../models/booking.model');
const Bus = require('../models/bus.model'); // Make sure Bus model is also available for population
const { protect, adminProtect } = require('../middleware/auth.middleware');

// User: Create a new booking
router.post('/', protect, async (req, res) => {
  try {
    const { busId, journeyDate, seats, passengers, total } = req.body;
    const booking = new Booking({
      userId: req.user._id,
      busId,
      journeyDate,
      seats,
      passengers,
      total,
    });
    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    console.error('ERROR CREATING BOOKING:', error);
    res.status(500).json({ message: 'Server error while creating booking.' });
  }
});

// User: Get their own bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).populate('busId');
    res.json(bookings);
  } catch (error) {
    console.error('ERROR FETCHING USER BOOKINGS:', error);
    res.status(500).json({ message: 'Server error while fetching bookings.' });
  }
});

// User/Public: Get a single booking by ID (for ticket/tracking page)
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('busId');
    // Security check: Ensure the user requesting the booking is the one who owns it
    if (booking && booking.userId.toString() === req.user._id.toString()) {
      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found or not authorized' });
    }
  } catch (error) {
    console.error('ERROR FETCHING SINGLE BOOKING:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this route inside backend/routes/bookings.routes.js

// User: Cancel a booking
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (booking && booking.userId.toString() === req.user._id.toString()) {
      booking.status = 'CANCELLED';
      await booking.save();
      res.json({ message: 'Booking cancelled successfully.' });
    } else {
      res.status(404).json({ message: 'Booking not found or not authorized' });
    }
  } catch (error) {
    console.error('ERROR CANCELLING BOOKING:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all bookings
router.get('/', adminProtect, async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('userId', 'name email').populate('busId');
    res.json(bookings);
  } catch (error) {
    console.error('ERROR FETCHING ALL BOOKINGS FOR ADMIN:', error);
    res.status(500).json({ message: 'Server error while fetching all bookings.' });
  }
});

module.exports = router;