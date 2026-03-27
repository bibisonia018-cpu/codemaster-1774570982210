const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  encryptedText: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // THE SECRET SAUCE: Auto-delete messages after 3600 seconds (1 Hour)
    expires: 3600 
  }
});

module.exports = mongoose.model('Message', MessageSchema);