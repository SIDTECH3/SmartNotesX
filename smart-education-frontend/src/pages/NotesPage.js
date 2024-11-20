import React, { useState, useEffect } from 'react';
import { createNote, getNotes } from '../services/notesService';
import './NotesPage.css';

const NotesPage = () => {
  const [folderName, setFolderName] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [notes, setNotes] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending request to create note...');
      const newNote = await createNote({ folderName, subTopic, suggestions });
      setNotes((prevNotes) => [...prevNotes, newNote]);
      setFolderName('');
      setSubTopic('');
      setSuggestions('');
      alert('Note created successfully!');
    } catch (error) {
      console.error('Error creating note:', error);
      console.error('Request failed with:', error.response?.data || 'No response from server');
      alert('Failed to create note.');
    }
  };
  
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div>
      <h2>Notes</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Folder Name:</label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Sub-topic:</label>
          <input
            type="text"
            value={subTopic}
            onChange={(e) => setSubTopic(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Suggestions (optional):</label>
          <textarea
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
          />
        </div>
        <button type="submit">Create Note</button>
      </form>

      <h3>Your Notes:</h3>
      <ul>
        {notes.map((note, index) => (
          <li key={index}>
            <strong>{note.subTopic}</strong> - {note.folderName}
            <button>Edit</button>
            <button>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotesPage;
