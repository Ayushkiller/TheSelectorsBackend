const express = require('express');
const Interview = require('../models/Interview');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const interviews = await Interview.find();
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { subject, date, candidateName, requiredExpertise } = req.body;
  try {
    const newInterview = new Interview({ subject, date, candidateName, requiredExpertise });
    const savedInterview = await newInterview.save();
    res.status(201).json(savedInterview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
