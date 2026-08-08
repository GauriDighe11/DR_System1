// HomeScreen.js
import React from "react";
import "./HomeScreen.css";
import substationImage from "../assets/substation.jpg";
import energyUsageImage from "../assets/energy-usage.jpg";
import cityGridImage from "../assets/city-grid.jpg";
import analyticsImage from "../assets/analytics.jpg";
import dashboardImage from "../assets/dashboard.png";

const HomeScreen = () => {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <header className="hero-section" style={{ backgroundImage: `url(${substationImage})` }}>
                <div className="hero-content">
                    <h1>AI-Based Demand Response System</h1>
                    <p className="tagline">
                        Empowering Smart Grids with Advanced AI Insights
                    </p>
                    <button 
                        className="cta-button" 
                        onClick={() => window.location.href = "/login"}
                    >
                        Get Started
                    </button>
                </div>
            </header>

            {/* Project Overview Section */}
            <section className="overview-section">
                <h2>Optimizing Energy Usage for a Sustainable Future</h2>
                <p>
                    Our AI-driven system provides real-time insights into energy consumption, 
                    predicts demand for the next 24 hours, and helps manage load efficiently. 
                    It assists consumers by offering alerts on peak hours and dynamic pricing, 
                    enabling smart decisions for energy usage.
                </p>
                <div className="overview-cards">
                    <div className="card">
                        <img src={energyUsageImage} alt="Energy Management" />
                        <h3>Smart Energy Management</h3>
                        <p>Visualize and control energy usage with powerful analytics.</p>
                    </div>
                    <div className="card">
                        <img src={cityGridImage} alt="Smart Grid" />
                        <h3>City-Wide Grid Insights</h3>
                        <p>Monitor and optimize energy distribution across the grid.</p>
                    </div>
                    <div className="card">
                        <img src={analyticsImage} alt="Predictive Analytics" />
                        <h3>Predictive Analytics</h3>
                        <p>Leverage AI for accurate demand and price forecasting.</p>
                    </div>
                    <div className="card">
                        <img src={dashboardImage} alt="Interactive Dashboard" />
                        <h3>Interactive Dashboards</h3>
                        <p>Get actionable insights through intuitive visualizations.</p>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="cta-section">
                <h2>Join Us in Building Smarter Cities</h2>
                <p>
                    Experience the future of energy management with our cutting-edge AI solution. 
                    Make informed decisions, save costs, and contribute to a sustainable world.
                </p>
                <button 
                    className="cta-button-large" 
                    onClick={() => window.location.href = "/login"}
                >
                    Start Your Journey Today!
                </button>
            </section>
        </div>
    );
};

export default HomeScreen;
