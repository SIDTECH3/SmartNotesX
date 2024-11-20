const express = require('express');
const router = express.Router();
const { 
  createAssignment, 
  editAssignment, 
  downloadAssignmentAsPDF, 
  saveAssignmentVersion, 
  getAssignmentVersions,
  addTagsToAssignment,
  searchAssignmentsByTags,
  getAssignmentByLink,
} = require('../controllers/assignmentController');
const authMiddleware = require('../middleware/authMiddleware');

// Route for creating an assignment
router.post('/', authMiddleware, createAssignment);

// Route for editing an assignment
router.put('/:id', authMiddleware, editAssignment);

// Route for downloading an assignment as PDF
router.get('/:id/download', authMiddleware, downloadAssignmentAsPDF);

// Route to save a new version of the assignment
router.post('/:id/versions', authMiddleware, saveAssignmentVersion);

// Route to retrieve all versions of an assignment
router.get('/:id/versions', authMiddleware, getAssignmentVersions);

router.put('/:id/tags', authMiddleware, addTagsToAssignment); // Add tags to an assignment
router.post('/search', authMiddleware, searchAssignmentsByTags); // Search assignments by tags

router.get('/share/:link', getAssignmentByLink);  // Route to retrieve an assignment by its shareable link

module.exports = router;
