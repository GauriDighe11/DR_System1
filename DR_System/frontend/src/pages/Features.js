// Features.js
import React from 'react';
import './Features.css';
import featureBg from '../assets/feature-bg.jpg';
import iconMonitor from '../assets/icon-monitor.png';
import iconForecast from '../assets/icon-forecast.png';
import iconAlert from '../assets/icon-alert.png';
import iconAnomaly from '../assets/icon-anomaly.png';
import iconPrice from '../assets/icon-price.png';
import iconIntegration from '../assets/icon-integration.png';

const Features = () => {
    return (
        <div className="features-page">
            {/* Hero Section */}
            <section className="features-hero" style={{ backgroundImage: `url(${featureBg})` }}>
                <div className="hero-content">
                    <h1>Explore the Powerful Features</h1>
                    <p>Revolutionizing Smart Grids with AI-Driven Solutions</p>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">Core Features of Our System</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <img src={iconMonitor} alt="Real-Time Monitoring" />
                        <h3>Real-Time Monitoring</h3>
                        <p>tracking of electricity consumption and pricing.</p>
                    </div>

                    <div className="feature-card">
                        <img src={iconForecast} alt="Demand Forecasting" />
                        <h3>Demand Forecasting</h3>
                        <p>Predicts hourly electricity demand for the next 24 hours.</p>
                    </div>

                    <div className="feature-card">
                        <img src={iconPrice} alt="Price & Peak Hour Prediction" />
                        <h3>Price & Peak Hour Prediction</h3>
                        <p>Forecasts peak hours and increases electricity prices by a specific factor.</p>
                    </div>

                    <div className="feature-card">
                        <img src={iconAnomaly} alt="Anomaly Detection" />
                        <h3>Anomaly Detection</h3>
                        <p>Identify unusual energy consumption patterns and ensure system stability.</p>
                    </div>

                    <div className="feature-card">
                        <img src={iconAlert} alt="Smart Alerts" />
                        <h3>Smart Alerts</h3>
                        <p>Notify consumers about peak hours, dynamic pricing, and energy-saving opportunities.</p>
                    </div>

                    <div className="feature-card">
                        <img src={iconIntegration} alt="Seamless Integration" />
                        <h3>Seamless Integration</h3>
                        <p>Smoothly connects with grid and consumer systems.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Features;
