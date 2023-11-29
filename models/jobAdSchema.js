const mongoose = require('mongoose');

const jobAdSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
  },
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
  close: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bids: [
    {
      bidderId: {
        type: String,
        required: true,
      },
      firstname: {
        type: String,
        require: true,
      },
      bidAmount: {
        type: Number,
        required: true,
      },
      bidTime: {
        type: Date,
        default: Date.now,
      },
      rewarded: {
        type: Boolean,
        default: false,
      },
      messages: [
        {
          senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          message: {
            type: String,
            required: true,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  ],
});

const JobAd = mongoose.model('JobAd', jobAdSchema);

module.exports = JobAd;
