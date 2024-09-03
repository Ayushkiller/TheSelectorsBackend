const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

// Initialize the Express application
const app = express();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cors()); // For enabling CORS

// Connect to MongoDB and create default user
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
    await createDefaultUser(); // Create default user after successful connection
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1); // Exit process with failure
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
    console.error('Error creating default user:', err.message);
  }
};

// Import routes
const interviewRoutes = require('./routes/interviewRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Use routes
app.use('/api/interviews', interviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Connect to the database and start the server
connectDB();
