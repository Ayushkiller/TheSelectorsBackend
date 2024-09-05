const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

const router = express.Router();

router.put('/update', authMiddleware, async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      user.email = email;
    }

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json({ message: 'User updated' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
