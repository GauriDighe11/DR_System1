// Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        alert('Logged out successfully!');
        navigate('/');
    };

    return (
        <div className="home-container">
            <Navbar />
            <h1>Welcome to the Home Page!</h1>
            <p>This is the main page after login.</p>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Home;
