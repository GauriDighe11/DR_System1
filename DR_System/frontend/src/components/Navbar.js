// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.jpeg'; 
const Navbar = () => {
    return (
      <nav className="navbar">
        <div className="navbar-brand">
          <img src={logo} alt="AI Demand Response System Logo" className="navbar-logo" />
          <span className="navbar-title">AI Demand Response System</span>
        </div>
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/Features">Features</Link></li>
          <li><Link to="/About">About Us</Link></li>
          <li><Link to="/Contact">Contact Us</Link></li>
        </ul>
      </nav>
    );
  };
  
  export default Navbar;