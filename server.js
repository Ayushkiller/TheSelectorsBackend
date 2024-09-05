const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');

// Models
const User = require('./models/User');
const Expert = require('./models/Expert'); // Assuming separate model files for Expert
const Interview = require('./models/Interview'); // Assuming separate model files for Interview

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

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

// Expert routes
app.get('/api/experts', async (req, res) => {
  try {
    const experts = await Expert.find();
    res.json(experts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/experts', async (req, res) => {
  const { name, expertise, experience } = req.body;
  try {
    const newExpert = new Expert({ name, expertise, experience });
    const savedExpert = await newExpert.save();
    res.status(201).json(savedExpert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Interview routes
app.get('/api/interviews', async (req, res) => {
  try {
    const interviews = await Interview.find();
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/interviews', async (req, res) => {
  const { subject, date, candidateName, requiredExpertise } = req.body;
  try {
    const newInterview = new Interview({ subject, date, candidateName, requiredExpertise });
    const savedInterview = await newInterview.save();
    res.status(201).json(savedInterview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Authentication and user routes (imported)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Connect to the database and start the server
connectDB();
