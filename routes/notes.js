const express = require('express');
const router = express.Router();
const { 
  createNote, 
  editNote, 
  downloadNoteAsPDF, 
  saveNoteVersion, 
  addTagsToNote,
  getNoteVersions,
  searchNotesByTags,
  getNoteByLink,
} = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware'); // Protect routes

// Route for creating notes
router.post('/', authMiddleware, createNote);

// Route for editing notes
router.put('/:id', authMiddleware, editNote);

// Route for downloading notes as PDF
router.get('/:id/download', authMiddleware, downloadNoteAsPDF);

// Route to save a new version of the note
router.post('/:id/versions', authMiddleware, saveNoteVersion);

// Route to retrieve all versions of a note
router.get('/:id/versions', authMiddleware, getNoteVersions);

router.put('/:id/tags', authMiddleware, addTagsToNote); // Add tags to a note
router.post('/search', authMiddleware, searchNotesByTags); // Search notes by tags

router.get('/share/:link', getNoteByLink);  // Route to retrieve a note by its shareable link


module.exports = router;
