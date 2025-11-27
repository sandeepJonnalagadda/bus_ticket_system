const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  operator: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  dep: { type: String, required: true },
  arr: { type: String, required: true },
  duration: { type: String, required: true },
  fare: { type: Number, required: true },
  seats: { type: Number, required: true },
});

module.exports = mongoose.model('Bus', busSchema);