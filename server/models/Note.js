const mongoose = require('mongoose');

const ScreenshotSchema = new mongoose.Schema({
  timestamp: {
    type: Number,
    required: true,
  },
  formattedTime: {
    type: String,
    required: true,
  },
  dataUrl: {
    type: String, // Can store base64 or static local URL path
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  videoId: {
    type: String,
    required: [true, 'Please add a videoId'],
  },
  timestamp: {
    type: Number,
    required: [true, 'Please add a timestamp in seconds'],
  },
  formattedTime: {
    type: String,
    required: [true, 'Please add formattedTime (mm:ss)'],
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  content: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['Key Takeaway', 'Code Snippet', 'Summary', 'Question', 'General'],
    default: 'General',
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'yellow',
  },
  screenshot: {
    type: ScreenshotSchema,
  },
}, {
  timestamps: true,
});

NoteSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    return ret;
  }
});

module.exports = mongoose.model('Note', NoteSchema);
