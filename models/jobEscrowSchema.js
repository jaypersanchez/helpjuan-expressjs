const mongoose = require('mongoose');

const jobEscrowSchema = new mongoose.Schema({
  jobid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobAd',
    required: true,
  },
  jobbidid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobAd.bids',
    required: false,
  },
  escrowAmount: {
    type: Number,
    required: true,
    default: 0, // You can adjust the default value as needed
  },
});

const JobEscrow = mongoose.model('JobEscrow', jobEscrowSchema);

module.exports = JobEscrow;
