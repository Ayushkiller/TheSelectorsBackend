// /backend/routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Update User Route
router.put('/update', authMiddleware, async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user email and/or password
    if (email) user.email = email;
    if (newPassword) {
      user.password = newPassword; // Password will be hashed by pre-save hook
    }

    await user.save();
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
