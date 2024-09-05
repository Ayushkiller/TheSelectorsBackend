const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

// Models
const User = require('./models/User');
const Expert = require('./models/Expert');
const Interview = require('./models/Interview');

// Initialize Express app
const app = express();


// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Stack trace in development
  });
};

// Connect to MongoDB and create default user
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/interview-panel', {
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
      password: 'helloworld',
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

// Expert routes
app.get('/api/experts', async (req, res, next) => {
  try {
    const experts = await Expert.find();
    res.json(experts);
  } catch (err) {
    next(err); // Forward error to centralized handler
  }
});

app.post('/api/experts', [
  check('name').notEmpty().withMessage('Name is required'),
  check('expertise').notEmpty().withMessage('Expertise is required'),
  check('experience').isNumeric().withMessage('Experience must be a number')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, expertise, experience } = req.body;
  try {
    const newExpert = new Expert({ name, expertise, experience });
    const savedExpert = await newExpert.save();
    res.status(201).json(savedExpert);
  } catch (err) {
    next(err); // Forward error to centralized handler
  }
});

// Interview routes
app.get('/api/interviews', async (req, res, next) => {
  try {
    const interviews = await Interview.find();
    res.json(interviews);
  } catch (err) {
    next(err); // Forward error to centralized handler
  }
});

app.post('/api/interviews', [
  check('subject').notEmpty().withMessage('Subject is required'),
  check('date').notEmpty().withMessage('Date is required'),
  check('candidateName').notEmpty().withMessage('Candidate Name is required'),
  check('requiredExpertise').notEmpty().withMessage('Required Expertise is required')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { subject, date, candidateName, requiredExpertise } = req.body;
  try {
    const newInterview = new Interview({ subject, date, candidateName, requiredExpertise });
    const savedInterview = await newInterview.save();
    res.status(201).json(savedInterview);
  } catch (err) {
    next(err); // Forward error to centralized handler
  }
});

// Authentication and user routes (imported)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Centralized error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`)); // Bind to 0.0.0.0 to accept external connections

// Connect to the database and start the server
connectDB();
