import axios from 'axios';

const API_URL = 'http://localhost:5001/api/notes'; // Backend endpoint

export const createNote = async (noteData) => {
  const response = await axios.post(API_URL, noteData);
  return response.data;
};

export const getNotes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const editNote = async (id, updatedContent) => {
  const response = await axios.put(`${API_URL}/${id}`, updatedContent);
  return response.data;
};

export const downloadNote = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/download`, {
    responseType: 'blob', // Important for downloading files
  });
  return response;
};
