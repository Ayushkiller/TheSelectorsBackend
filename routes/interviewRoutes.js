import React, { useState, useRef, useEffect } from 'react';
import { TextField, Button, Container, Typography, Paper, Snackbar, CircularProgress, Grid, Chip, Alert, Box } from '@mui/material';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateInterview = () => {
  const [form, setForm] = useState({
    subject: '',
    date: '',
    candidateName: '',
    requiredSkills: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [expertiseEvaluation, setExpertiseEvaluation] = useState({});
  const [currentSkill, setCurrentSkill] = useState('');
  const [skillsToEvaluate, setSkillsToEvaluate] = useState([]);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.subject) newErrors.subject = 'Subject is required';
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.candidateName) newErrors.candidateName = 'Candidate name is required';
    if (!form.requiredSkills) newErrors.requiredSkills = 'At least one skill is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = {
        ...form,
        requiredExpertise: JSON.stringify(expertiseEvaluation),
      };

      const response = await fetch('http://192.168.3.13:8000/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSnackbar({ open: true, message: 'Interview created successfully!', severity: 'success' });
        setTimeout(() => navigate('/'), 2000);
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to create interview', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Network error. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const startEvaluation = () => {
    const skills = form.requiredSkills.split(',').map(skill => skill.trim());
    setSkillsToEvaluate(skills);
    setCurrentSkill(skills[0]);
    setChatHistory([{ role: 'assistant', content: `Let's start with ${skills[0]}. Can you tell me about your experience in this area?` }]);
  };

  const handleChat = async () => {
    if (!userInput.trim()) return;

    const newUserMessage = { role: 'user', content: userInput };
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserInput('');
    setLoading(true);

    try {
      const response = await fetch('http://192.168.3.13:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'user',
          content: userInput,
          currentSkill,
          chatHistory,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = { role: 'assistant', content: data.content };
        setChatHistory(prev => [...prev, assistantMessage]);

        if (data.rating) {
          setExpertiseEvaluation(prev => ({ ...prev, [currentSkill]: data.rating }));
          const nextSkill = skillsToEvaluate[skillsToEvaluate.indexOf(currentSkill) + 1];
          if (nextSkill) {
            setCurrentSkill(nextSkill);
            setChatHistory(prev => [...prev, { role: 'assistant', content: `Let's move on to ${nextSkill}. Tell me about your experience in this area.` }]);
          } else {
            setChatHistory(prev => [...prev, { role: 'assistant', content: 'Thank you for completing the evaluation!' }]);
          }
        }
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch response from server', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Paper sx={{ padding: 3, marginTop: 3 }}>
        <Typography variant="h4" gutterBottom>Create Interview</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            error={!!errors.subject}
            helperText={errors.subject}
          />
          <TextField
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
            error={!!errors.date}
            helperText={errors.date}
          />
          <TextField
            label="Candidate Name"
            name="candidateName"
            value={form.candidateName}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            error={!!errors.candidateName}
            helperText={errors.candidateName}
          />
          <TextField
            label="Required Skills (comma-separated)"
            name="requiredSkills"
            value={form.requiredSkills}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            error={!!errors.requiredSkills}
            helperText={errors.requiredSkills}
          />

          <Button variant="contained" color="secondary" onClick={startEvaluation} sx={{ marginTop: 2 }}>
            Start Skills Evaluation
          </Button>

          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6">Chat with AI</Typography>
            <Box sx={{ height: 300, overflowY: 'scroll', padding: 2, border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#fafafa' }}>
              {chatHistory.map((msg, index) => (
                <Box key={index} sx={{ marginBottom: 2, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  <Typography variant="body1" sx={{
                    backgroundColor: msg.role === 'user' ? '#e1f5fe' : '#f1f8e9',
                    padding: 1,
                    borderRadius: 2,
                    display: 'inline-block',
                    maxWidth: '80%',
                  }}>
                    {msg.content}
                  </Typography>
                </Box>
              ))}
              <div ref={chatEndRef} />
            </Box>

            <Box sx={{ display: 'flex', marginTop: 2 }}>
              <TextField
                label="Type your message..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                fullWidth
                margin="normal"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChat()}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleChat}
                sx={{ marginLeft: 1, alignSelf: 'center' }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : <Send />}
              </Button>
            </Box>
          </Box>

          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6">Expertise Evaluation</Typography>
            <Grid container spacing={1}>
              {Object.entries(expertiseEvaluation).map(([skill, rating], index) => (
                <Grid item key={index}>
                  <Chip label={`${skill}: ${rating}`} color="primary" variant="outlined" />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ marginTop: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Interview'}
          </Button>
        </form>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateInterview;
