const mongoose = require('mongoose');

const jobAdSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
});

const JobAd = mongoose.model('JobAd', jobAdSchema);

module.exports = JobAd;
