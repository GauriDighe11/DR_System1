import React, { useState, useEffect, useCallback } from 'react';
import './ConsumerDashboard.css';

const ConsumerDashboard = () => {
    const [historicalData, setHistoricalData] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [consumerQuery, setConsumerQuery] = useState('');
    const [queries, setQueries] = useState([]);


    // Get user info from localStorage or mock data
    const currentUser = JSON.parse(localStorage.getItem('user')) || {
        id: 'user123',
        name: 'Demo User',
        email: 'demo@example.com'
    };

    // Fetch historical data on initial load
    const fetchHistoricalData = useCallback(async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/historical-data');
            const data = await response.json();
            console.log('Fetched Historical Data:', data); // Debugging log
            setHistoricalData(data);
        } catch (error) {
            console.error('Error fetching historical data:', error);
        }
    }, []);

    // Fetch alerts sent by the grid operator
    const fetchAlerts = useCallback(async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/alerts');
            const data = await response.json();
            console.log('Fetched Alerts:', data); // Debugging log
            setAlerts(data);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    }, []);

    // Auto-update historical data and alerts every 24 hours
    useEffect(() => {
        fetchHistoricalData();
        fetchAlerts();
        const interval = setInterval(() => {
            fetchHistoricalData();
            fetchAlerts();
        }, 24 * 60 * 60 * 1000); // Update every 24 hours

        return () => clearInterval(interval);
    }, [fetchHistoricalData, fetchAlerts]);

    // Handle consumer query submission
    const handleQuerySubmit = async (e) => {
        e.preventDefault();
        if (!consumerQuery.trim()) return;

        try {
            const user = JSON.parse(localStorage.getItem('user')) || {
                name: 'Current User',
                email: 'user@example.com'
            };

            const response = await fetch('http://127.0.0.1:5000/api/submit-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: consumerQuery,
                    user_name: user.name,
                    user_email: user.email
                }),
            });

            if (response.ok) {
                setConsumerQuery('');
            }
        } catch (error) {
            console.error('Error submitting query:', error);
        }
    };

    const deletePrediction = async (alertId) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/delete-prediction/${alertId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setAlerts(prev => prev.filter(alert => alert._id !== alertId));
            }
        } catch (error) {
            console.error('Error deleting prediction:', error);
        }
    };
    return (
        <div className="consumer-dashboard">
            <h1 className="heading">Consumer Dashboard</h1>

            {/* Historical Data Table */}
            <div className="historical-data">
                <h2>Historical Consumption</h2>
                <p className="section-description">
                    "The table displays historical electricity consumption data, highlighting actual demand, pricing trends, and designated peak hours."
                </p>
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Actual Demand (MW)</th>
                            <th>Price ($)</th>
                            <th>Peak Hour</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historicalData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.datetime || 'N/A'}</td>
                                <td>{(row.actual_demand || 0).toFixed(2)}</td>
                                <td>${(row.Price || 0).toFixed(2)}</td>
                                <td>{row.Peak_Hour ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Alerts Section */}
            <div className="alerts">
                <h2>Alerts from Grid Operator</h2>
                <p className="section-description">
                    "Important updates and predictions from the grid operator."
                </p>
                {alerts.map((alert, index) => (
                    <div key={index} className="alert-card">
                        <div className="alert-content">
                            <p className="time">
                                ⏰ <strong>{alert.datetime || 'N/A'}</strong>
                            </p>
                            <p className="demand">
                                📊 Predicted Demand: <strong>{alert.predicted_demand?.toFixed(2) || 'N/A'} MW</strong>
                            </p>
                            <p className="price">
                                💰 Price: <strong>${alert.Price?.toFixed(2) || 'N/A'}</strong>
                            </p>
                            <p className="peak-hour">
                                {alert.Peak_Hour ? (
                                    <span className="peak-yes">⚠️ Peak Hour Alert!</span>
                                ) : (
                                    <span className="peak-no">✅ Normal Hour</span>
                                )}
                            </p>


                        </div>
                        <div className="alert-actions">
                            <button
                                onClick={() => deletePrediction(alert._id)}
                                className="delete-prediction-btn"
                            >
                                Delete
                            </button>
                        </div>

                    </div>
                ))}
            </div>

            {/* Consumer Query Section */}
            <div className="consumer-query">
                <h2>Contact Grid Operator</h2>
                <p className="section-description">
                    "Have a question or concern? Send a message to the grid operator."
                </p>
                <form onSubmit={handleQuerySubmit}>
                    <textarea
                        value={consumerQuery}
                        onChange={(e) => setConsumerQuery(e.target.value)}
                        placeholder="Type your query here..."
                        required
                    />
                    <button type="submit">Send Query</button>
                </form>

                {/* Display Submitted Queries */}
                {queries.length > 0 && (
                    <div className="submitted-queries">
                        <h3>Your Queries</h3>
                        <ul>
                            {queries.map((query, index) => (
                                <li key={index}>{query}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsumerDashboard;