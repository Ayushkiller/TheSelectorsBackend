const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock data
let experts = [
  { id: 1, name: 'Hello World', expertise: 'Web Development', experience: 5 },
  { id: 2, name: 'Magical people', expertise: 'Data Science', experience: 7 },
  { id: 3, name: 'Happy moments', expertise: 'UI/UX Design', experience: 4 },
];

let interviews = [];

// Routes
app.get('/api/experts', (req, res) => {
  res.json(experts);
});

app.post('/api/interviews', (req, res) => {
  const newInterview = { id: interviews.length + 1, ...req.body };
  interviews.push(newInterview);
  res.status(201).json(newInterview);
});

app.get('/api/interviews', (req, res) => {
  res.json(interviews);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
