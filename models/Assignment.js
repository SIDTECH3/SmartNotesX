const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // References the user
  subTopic: { type: String, required: true }, // Sub-topic for the assignment
  university: { type: String, required: false }, // Optional university name
  questions: [
    {
      type: { type: String, required: true }, // MCQ or descriptive
      question: { type: String, required: true },
      options: { type: [String], required: false }, // For MCQs
      answer: { type: String, required: false }, // Correct answer
    },
  ],
  createdAt: { type: Date, default: Date.now }, // Timestamp
  versions: [
    {
      versionNumber: { type: Number, required: true }, // Version number
      questions: { type: Array, required: true }, // List of questions in the version
      savedAt: { type: Date, default: Date.now }, // Timestamp of version creation
    },
  ],
  tags: { type: [String], default: [] }, // Array of tags
  shareableLink: { type: String, unique: true },   //Add a shareableLink field to store the unique link.
       


});

module.exports = mongoose.model('Assignment', AssignmentSchema);
