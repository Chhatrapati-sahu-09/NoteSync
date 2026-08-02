const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const VideoProgress = require('../models/VideoProgress');
const { protect } = require('../middleware/auth');

// Default initial videos to seed database if empty
const INITIAL_VIDEOS = [
  {
    title: 'React 19 & Next.js 15 Masterclass - Key Features Explained',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 596,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
    categories: ['React', 'Web Dev', 'Frontend', 'JavaScript'],
  },
  {
    title: 'Building Notion-Inspired Minimal UI Components with Tailwind',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 653,
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop',
    categories: ['UI/UX', 'Design', 'Tailwind CSS'],
  }
];

// @desc    Get all videos (global + user uploaded) with progress populated
// @route   GET /api/videos
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Check if we need to seed database with initial videos
    let globalVideosCount = await Video.countDocuments({ userId: null });
    if (globalVideosCount === 0) {
      await Video.insertMany(INITIAL_VIDEOS);
    }

    // Fetch all global videos + current user's custom videos
    const videosList = await Video.find({
      $or: [{ userId: null }, { userId: req.user._id }]
    }).sort({ createdAt: -1 });

    // Fetch progress map for current user
    const progresses = await VideoProgress.find({ userId: req.user._id });
    const progressMap = {};
    progresses.forEach(p => {
      progressMap[p.videoId] = {
        currentTime: p.currentTime,
        lastPlayedAt: p.lastPlayedAt
      };
    });

    // Map DB videos to client-expected format
    const formattedVideos = videosList.map(v => {
      const dbIdString = v._id.toString();
      // Look up progress by either original seed ID (fallback) or MongoDB _id string
      const prog = progressMap[dbIdString] || { currentTime: 0, lastPlayedAt: v.createdAt };
      
      return {
        id: dbIdString,
        title: v.title,
        url: v.url,
        duration: v.duration,
        thumbnail: v.thumbnail,
        categories: v.categories,
        currentTime: prog.currentTime,
        lastPlayedAt: prog.lastPlayedAt
      };
    });

    res.json(formattedVideos);
  } catch (error) {
    console.error('Fetch videos error:', error);
    res.status(500).json({ message: 'Server error fetching videos' });
  }
});

// @desc    Add a custom video
// @route   POST /api/videos
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, url, duration, thumbnail } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: 'Please provide video title and URL' });
    }

    const video = await Video.create({
      userId: req.user._id,
      title,
      url,
      duration: duration || 300,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      categories: ['Custom Upload'],
    });

    res.status(201).json({
      id: video._id.toString(),
      title: video.title,
      url: video.url,
      duration: video.duration,
      thumbnail: video.thumbnail,
      categories: video.categories,
      currentTime: 0,
      lastPlayedAt: video.createdAt,
    });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ message: 'Server error creating video' });
  }
});

// @desc    Update video playback progress
// @route   PUT /api/videos/:id/progress
// @access  Private
router.put('/:id/progress', protect, async (req, res) => {
  try {
    const videoId = req.params.id;
    const { currentTime } = req.body;

    if (currentTime === undefined) {
      return res.status(400).json({ message: 'Please provide current playback time' });
    }

    const progress = await VideoProgress.findOneAndUpdate(
      { userId: req.user._id, videoId },
      { currentTime, lastPlayedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json({
      videoId,
      currentTime: progress.currentTime,
      lastPlayedAt: progress.lastPlayedAt
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error updating video progress' });
  }
});

module.exports = router;
