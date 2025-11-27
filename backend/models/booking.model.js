const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  seat: Number,
});

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  journeyDate: { type: String, required: true },
  seats: { type: [Number], required: true },
  passengers: [passengerSchema],
  total: { type: Number, required: true },
  status: { type: String, default: 'CONFIRMED' }, // CONFIRMED, CANCELLED
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);