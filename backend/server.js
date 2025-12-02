require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
// app.use(cors()); // for deployment
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8000",
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('SmartBus API is running...');
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/buses', require('./routes/buses.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/users', require('./routes/users.routes'));
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));