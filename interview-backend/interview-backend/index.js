const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cors = require('cors');


// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/interview-panel', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

// Define models
const Expert = mongoose.model('Expert', new mongoose.Schema({
  name: { type: String, required: true },
  expertise: { type: String, required: true },
  experience: { type: Number, required: true },
}));

const Interview = mongoose.model('Interview', new mongoose.Schema({
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  candidateName: { type: String, required: true },
  requiredExpertise: { type: String, required: true },
  expertAssigned: { type: Boolean, default: false },
}));

// Routes
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
