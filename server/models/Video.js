const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null means global/shared video
  },
  title: {
    type: String,
    required: [true, 'Please add a video title'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Please add a video URL'],
  },
  duration: {
    type: Number,
    required: [true, 'Please add a duration'],
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
  },
  categories: {
    type: [String],
    default: ['General'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

VideoSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    return ret;
  }
});

module.exports = mongoose.model('Video', VideoSchema);
