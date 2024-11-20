import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import NotesPage from './pages/NotesPage';
import AssignmentsPage from './pages/AssignmentsPage';

const App = () => {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
        </Routes>
      </main>
    </Router>
  );
  
};

export default App;
