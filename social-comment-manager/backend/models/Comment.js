const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true,
    maxlength: 150
  },
  status: {
    type: String,
    enum: ['posted', 'failed', 'pending'],
    default: 'posted'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', commentSchema);