const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['tiktok', 'instagram']
  },
  username: {
    type: String,
    required: true
  },
  encryptedCookies: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'error'],
    default: 'connected'
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Account', accountSchema);