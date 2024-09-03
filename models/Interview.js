const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  candidateName: { type: String, required: true },
  requiredExpertise: { type: String, required: true },
  expertAssigned: { type: Boolean, default: false }
});

module.exports = mongoose.model('Interview', interviewSchema);