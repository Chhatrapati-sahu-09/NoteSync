const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');

// Helper to save base64 screenshot to local disk
const saveBase64Image = (base64Str) => {
  if (!base64Str || !base64Str.startsWith('data:image')) {
    return base64Str;
  }
  
  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return base64Str;
    
    const imageType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate unique file name
    const ext = imageType.split('/')[1] || 'png';
    const fileName = `sc-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    
    // Return server URL path
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error('Failed to save base64 image:', error);
    return base64Str;
  }
};

// @desc    Get all notes for authenticated user with optional search & category filtering
// @route   GET /api/notes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { videoId, category, q } = req.query;
    
    let query = { userId: req.user._id };
    
    if (videoId) {
      query.videoId = videoId;
    }
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ];
    }
    
    const notes = await Note.find(query).sort({ timestamp: 1, createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error fetching notes' });
  }
});

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { videoId, timestamp, formattedTime, title, content, category, color, screenshot } = req.body;

    if (!videoId || timestamp === undefined || !formattedTime || !title) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    let processedScreenshot;
    if (screenshot && screenshot.dataUrl) {
      const savedPath = saveBase64Image(screenshot.dataUrl);
      processedScreenshot = {
        timestamp: screenshot.timestamp,
        formattedTime: screenshot.formattedTime,
        dataUrl: savedPath,
      };
    }

    const note = await Note.create({
      userId: req.user._id,
      videoId,
      timestamp,
      formattedTime,
      title,
      content,
      category,
      color,
      screenshot: processedScreenshot,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error creating note' });
  }
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, content, category, color, isFavorite } = req.body;

    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Verify ownership
    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category;
    if (color !== undefined) note.color = color;
    if (isFavorite !== undefined) note.isFavorite = isFavorite;

    await note.save();
    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error updating note' });
  }
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Verify ownership
    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Optional: Delete physical screenshot file if it exists
    if (note.screenshot && note.screenshot.dataUrl && note.screenshot.dataUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', note.screenshot.dataUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Failed to delete physical screenshot file:', err);
        }
      }
    }

    await note.deleteOne();
    res.json({ message: 'Note removed successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error deleting note' });
  }
});

// @desc    Toggle favorite on a note
// @route   PUT /api/notes/:id/favorite
// @access  Private
router.put('/:id/favorite', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Verify ownership
    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    note.isFavorite = !note.isFavorite;
    await note.save();
    res.json(note);
  } catch (error) {
    console.error('Toggle favorite note error:', error);
    res.status(500).json({ message: 'Server error updating note' });
  }
});

module.exports = router;
