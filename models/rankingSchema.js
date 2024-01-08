const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobAd', // Reference to the JobAd model
    required: true,
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

const Ranking = mongoose.model('Ranking', rankingSchema);

module.exports = Ranking;
