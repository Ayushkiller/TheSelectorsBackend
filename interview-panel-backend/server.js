const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Mock data for experts and interviews
let experts = [
  { id: 1, name: 'John Doe', expertise: 'Web Development', experience: 5 },
  { id: 2, name: 'Jane Smith', expertise: 'Data Science', experience: 7 },
  { id: 3, name: 'Bob Johnson', expertise: 'UI/UX Design', experience: 4 },
];

let interviews = [
  { id: 1, subject: 'Frontend Developer', date: '2024-09-10', candidateName: 'Alice', requiredExpertise: 'Web Development' },
  // More mock interviews can be added here
];

// Get all experts
app.get('/api/experts', (req, res) => {
  res.json(experts);
});

// Create a new expert
app.post('/api/experts', (req, res) => {
  const newExpert = { id: experts.length + 1, ...req.body };
  experts.push(newExpert);
  res.json(newExpert);
});

// Get all interviews
app.get('/api/interviews', (req, res) => {
  res.json(interviews);
});

// Create a new interview
app.post('/api/interviews', (req, res) => {
  const newInterview = { id: interviews.length + 1, ...req.body };
  interviews.push(newInterview);
  res.json(newInterview);
});

// Get dashboard stats
app.get('/api/stats', (req, res) => {
  res.json({
    totalInterviews: interviews.length,
    pendingExpertAssignments: interviews.filter(i => !i.expertAssigned).length,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
