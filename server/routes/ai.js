const express = require('express');
const router = express.Router();
const { getSummary, getFlashcards, explainConcept } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI suite routes are protected
router.post('/summary', protect, getSummary);
router.post('/flashcards', protect, getFlashcards);
router.post('/explain', protect, explainConcept);

module.exports = router;
