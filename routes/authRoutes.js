const express = require('express');
const router = express.Router(); // Define the router here
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Make sure the path to the User model is correct

// Route for login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate a token (implementation depends on your setup)
    // For simplicity, we'll skip token generation in this example
    res.json({ msg: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
