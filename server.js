// /backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// Models
const User = require('./models/User');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
    await createDefaultUser(); // Create default user after successful connection
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

// Function to create a default user
const createDefaultUser = async () => {
  try {
    const defaultUser = {
      email: 'hello@example.com',
      password: 'helloworld', // Plain text password for hashing
    };

    // Check if user already exists
    const userExists = await User.findOne({ email: defaultUser.email });
    if (userExists) {
      console.log('Default user already exists.');
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultUser.password, salt);

    // Create and save new user with hashed password
    const newUser = new User({
      email: defaultUser.email,
      password: hashedPassword,
    });
    await newUser.save();
    console.log('Default user created.');
  } catch (err) {
    console.error(err.message);
  }
};

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Connect to database and start server
connectDB();
