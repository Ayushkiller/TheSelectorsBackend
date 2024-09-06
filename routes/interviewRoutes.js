const express = require('express');
const Interview = require('../models/Interview');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// GET all interviews
router.get('/', authMiddleware, async (req, res) => {
  try {
    const interviews = await Interview.find().sort({ date: 1 });
    res.json(interviews);
  } catch (err) {
    console.error('Error fetching interviews:', err);
    res.status(500).json({ message: 'Failed to fetch interviews. Please try again later.' });
  }
});

// POST new interview
router.post('/', [
  authMiddleware,
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('candidateName').trim().notEmpty().withMessage('Candidate name is required'),
  body('requiredExpertise').isJSON().withMessage('Required expertise must be valid JSON')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { subject, date, candidateName, requiredExpertise } = req.body;
    const newInterview = new Interview({ 
      subject, 
      date, 
      candidateName, 
      requiredExpertise: JSON.stringify(JSON.parse(requiredExpertise))
    });
    const savedInterview = await newInterview.save();
    res.status(201).json({
      message: 'Interview created successfully',
      interview: savedInterview
    });
  } catch (err) {
    console.error('Error creating new interview:', err);
    res.status(500).json({ message: 'Failed to create interview. Please try again.' });
  }
});

// GET single interview
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json(interview);
  } catch (err) {
    console.error('Error fetching interview:', err);
    res.status(500).json({ message: 'Failed to fetch interview. Please try again.' });
  }
});

// PUT update interview
router.put('/:id', [
  authMiddleware,
  body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty'),
  body('date').optional().isISO8601().toDate().withMessage('Valid date is required'),
  body('candidateName').optional().trim().notEmpty().withMessage('Candidate name cannot be empty'),
  body('requiredExpertise').optional().isJSON().withMessage('Required expertise must be valid JSON')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedInterview = await Interview.findByIdAndUpdate(
      req.params.id,
      { ...req.body, requiredExpertise: JSON.stringify(JSON.parse(req.body.requiredExpertise)) },
      { new: true, runValidators: true }
    );
    if (!updatedInterview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json({
      message: 'Interview updated successfully',
      interview: updatedInterview
    });
  } catch (err) {
    console.error('Error updating interview:', err);
    res.status(500).json({ message: 'Failed to update interview. Please try again.' });
  }
});

// DELETE interview
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deletedInterview = await Interview.findByIdAndDelete(req.params.id);
    if (!deletedInterview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json({ message: 'Interview deleted successfully' });
  } catch (err) {
    console.error('Error deleting interview:', err);
    res.status(500).json({ message: 'Failed to delete interview. Please try again.' });
  }
});

module.exports = router;