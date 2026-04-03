const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String, // String UUID mapping to Postgres Room ID
    required: true,
    index: true // Faster querying per room history
  },
  senderId: {
    type: String, // String UUID mapping to Postgres User ID
    required: true
  },
  senderName: { // Caching sender name to avoid DB joins on every message load
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'file'],
    default: 'text'
  },
  mediaUrl: {
    type: String
  },
  readBy: [{
    type: String // userIds
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Message', messageSchema);
