import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // We'll create styles for the header

const Header = () => {
  return (
    <header className="header">
      <nav className="navbar">
        <h1>Smart Education System</h1>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/notes">Notes</Link></li>
          <li><Link to="/assignments">Assignments</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
