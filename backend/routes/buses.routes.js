const express = require('express');
const router = express.Router();
const Bus = require('../models/bus.model');
const { adminProtect } = require('../middleware/auth.middleware');

// Search buses
router.get('/search', async (req, res) => {
  const { from, to } = req.query;
  const buses = await Bus.find({ 
    from: new RegExp(from, 'i'), 
    to: new RegExp(to, 'i') 
  });
  res.json(buses);
});

// GET a single bus by ID
router.get('/:id', async (req, res) => {
    try {
      const bus = await Bus.findById(req.params.id);
      if (bus) {
        res.json(bus);
      } else {
        res.status(404).json({ message: 'Bus not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

// Admin: Get all buses
router.get('/', adminProtect, async (req, res) => {
  const buses = await Bus.find({});
  res.json(buses);
});

// Admin: Create bus
router.post('/', adminProtect, async (req, res) => {
  const bus = new Bus(req.body);
  const createdBus = await bus.save();
  res.status(201).json(createdBus);
});

// Admin: Update bus
router.put('/:id', adminProtect, async (req, res) => {
  const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(bus);
});

// Admin: Delete bus
router.delete('/:id', adminProtect, async (req, res) => {
  await Bus.findByIdAndDelete(req.params.id);
  res.json({ message: 'Bus removed' });
});

module.exports = router;