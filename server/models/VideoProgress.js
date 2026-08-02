const mongoose = require('mongoose');

const VideoProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  currentTime: {
    type: Number,
    default: 0,
  },
  lastPlayedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure uniqueness per user per video
VideoProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('VideoProgress', VideoProgressSchema);
