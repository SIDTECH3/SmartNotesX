const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // References the user
  folderName: { type: String, required: true }, // Folder name
  subTopic: { type: String, required: true }, // Sub-topic name
  content: { type: String, required: true }, // Current note content
  suggestions: { type: String, default: '' }, // Optional suggestions by user
  createdAt: { type: Date, default: Date.now }, // Timestamp
  versions: [
    {
      versionNumber: { type: Number, required: true }, // Version number
      content: { type: String, required: true }, // Content of the version
      savedAt: { type: Date, default: Date.now }, // Timestamp of version creation
    },
  ],
  tags: { type: [String], default: [] }, // Array of tags
  shareableLink: { type: String, unique: true }, //Add a shareableLink field to store the unique link.



});

module.exports = mongoose.model('Note', NoteSchema);
