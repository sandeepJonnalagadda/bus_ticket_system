require('dotenv').config();
const mongoose = require('mongoose');
const Bus = require('./models/bus.model');

const sampleBuses = [
  { id:'B1001', name:'SmartBus AC Sleeper', type:'AC Sleeper', operator:'Smart Travels',
    from:'Hyderabad', to:'Bengaluru', dep:'22:00', arr:'07:00', duration:'9h', fare:1200, seats:34 },
  { id:'B1033', name:'SmartBus Seater', type:'AC Seater', operator:'Smart Travels',
    from:'Hyderabad', to:'Bengaluru', dep:'23:00', arr:'06:30', duration:'7h 30m', fare:999, seats:40 },
  { id:'B2204', name:'Velocity AC', type:'AC Seater', operator:'Velocity',
    from:'Hyderabad', to:'Chennai', dep:'21:15', arr:'06:45', duration:'9h 30m', fare:1100, seats:45 },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding.');
    
    // Clear existing buses
    await Bus.deleteMany({});
    console.log('Existing buses cleared.');

    // Insert sample buses
    await Bus.insertMany(sampleBuses);
    console.log('Sample bus data has been inserted!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seedDB();