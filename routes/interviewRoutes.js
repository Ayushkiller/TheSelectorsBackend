const express = require('express');
const Interview = require('../models/Interview');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('GET /api/interviews - Fetching all interviews');
  try {
    const interviews = await Interview.find();
    console.log(`Successfully fetched ${interviews.length} interviews`);
    res.json(interviews);
  } catch (err) {
    console.error('Error fetching interviews:', err);
    res.status(500).json({ message: 'Error fetching interviews', error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  console.log('POST /api/interviews - Creating new interview');
  const { subject, date, candidateName, requiredExpertise } = req.body;
  try {
    const newInterview = new Interview({ subject, date, candidateName, requiredExpertise });
    const savedInterview = await newInterview.save();
    console.log('Successfully created new interview:', savedInterview);
    res.status(201).json(savedInterview);
  } catch (err) {
    console.error('Error creating new interview:', err);
    res.status(400).json({ message: 'Error creating new interview', error: err.message });
  }
});

module.exports = router;