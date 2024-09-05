const express = require('express');
const Expert = require('../models/Expert');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const experts = await Expert.find();
    res.json(experts);
  } catch (err) {
    console.error('Error fetching experts:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { name, expertise, experience } = req.body;

  if (!name || !expertise || !experience) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newExpert = new Expert({ name, expertise, experience });
    const savedExpert = await newExpert.save();
    res.status(201).json(savedExpert);
  } catch (err) {
    console.error('Error creating expert:', err);
    res.status(400).json({ message: 'Error creating expert', error: err.message });
  }
});

module.exports = router;
