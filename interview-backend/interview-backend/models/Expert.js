const mongoose = require('mongoose');

const ExpertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  expertise: { type: String, required: true },
  experience: { type: Number, required: true },
});

module.exports = mongoose.model('Expert', ExpertSchema);
