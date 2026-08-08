import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import './GridOperatorDashboard.css';
import io from 'socket.io-client';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const GridOperatorDashboard = () => {
    const [socket, setSocket] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [anomalyStatus, setAnomalyStatus] = useState('No Anomaly');
    const [isFetchingPredictions, setIsFetchingPredictions] = useState(false);
    const [shouldUpdateHistoricalTable, setShouldUpdateHistoricalTable] = useState(false);
    const [consumerQueries, setConsumerQueries] = useState([]);
    const [isLoadingQueries, setIsLoadingQueries] = useState(false);

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('new-query', (newQuery) => {
            setConsumerQueries(prev => [{
                ...newQuery,
                _id: newQuery._id || Date.now().toString(),
                user_name: newQuery.user_name || 'Consumer',
                user_email: newQuery.user_email || '',
                timestamp: newQuery.timestamp || new Date().toISOString(),
                status: newQuery.status || 'unanswered'
            }, ...prev]);
        });

        return () => {
            socket.off('new-query');
        };
    }, [socket]);

    // Fetch historical data on initial load
    const fetchHistoricalData = useCallback(async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/historical-data');
            const data = await response.json();
            setHistoricalData(data);
        } catch (error) {
            console.error('Error fetching historical data:', error);
        }
    }, []);

    // Fetch actual data for the last 24 hours from the dataset
    const fetchActualDataRange = useCallback(async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/actual-data-range');
            const actualData = await response.json();
            const updatedHistoricalData = actualData.map((actualRow) => {
                const prediction = predictions.find(
                    (pred) => pred.datetime === actualRow.datetime
                );
                if (prediction) {
                    return {
                        ...actualRow,
                        predicted_demand: prediction.predicted_demand,
                    };
                }
                return actualRow;
            });
            setHistoricalData((prevHistoricalData) => [
                ...prevHistoricalData,
                ...updatedHistoricalData,
            ]);
        } catch (error) {
            console.error('Error fetching actual data range:', error);
        }
    }, [predictions]);

    // Fetch predictions for the next 24 hours
    const fetchPredictions = useCallback(async () => {
        if (isFetchingPredictions) return;
        setIsFetchingPredictions(true);
        setPredictions([]);
        try {
            if (shouldUpdateHistoricalTable) {
                await fetchActualDataRange();
                setShouldUpdateHistoricalTable(false);
            }
            const response = await fetch('http://127.0.0.1:5000/api/predict?continue=y');
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const messages = buffer.split('\n\n');
                for (let i = 0; i < messages.length - 1; i++) {
                    const msg = messages[i];
                    if (msg.startsWith('data:')) {
                        const prediction = JSON.parse(msg.substring(5).trim());
                        setPredictions((prevPredictions) => [...prevPredictions, prediction]);
                    }
                }
                buffer = messages[messages.length - 1];
            }
        } catch (error) {
            console.error('Error fetching predictions:', error);
        } finally {
            setIsFetchingPredictions(false);
            setShouldUpdateHistoricalTable(true);
        }
    }, [isFetchingPredictions, shouldUpdateHistoricalTable, fetchActualDataRange]);

    // Fetch consumer queries with authentication
    const fetchConsumerQueries = useCallback(async () => {
        setIsLoadingQueries(true);
        try {
            const response = await fetch('http://127.0.0.1:5000/api/get-queries');
            const data = await response.json();
            setConsumerQueries(data.map(query => ({
                ...query,
                _id: query._id || Date.now().toString(),
                user_name: query.user_name || 'Consumer',
                user_email: query.user_email || '',
                timestamp: query.timestamp || new Date().toISOString(),
                status: query.status || 'unanswered'
            })));
        } catch (error) {
            console.error('Error fetching consumer queries:', error);
        } finally {
            setIsLoadingQueries(false);
        }
    }, []);

    // Mark query as read
    const markQueryAsRead = async (queryId) => {
        try {
            await fetch(`http://127.0.0.1:5000/api/update-query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: queryId,
                    response: "Viewed by operator"
                })
            });
            setConsumerQueries(prev => prev.map(q =>
                q._id === queryId ? { ...q, status: 'answered' } : q
            ));
        } catch (error) {
            console.error('Error marking query as read:', error);
        }
    };

    // Detect anomalies and update graph
    useEffect(() => {
        if (historicalData.length > 0) {
            const threshold = 100;
            const last24Hours = historicalData.slice(-24);
            const anomalies = last24Hours.filter(
                (d) => Math.abs(d.predicted_demand - d.actual_demand) > threshold
            );
            setAnomalyStatus(anomalies.length > 0 ? 'Anomaly Detected' : 'No Anomaly');
        }
    }, [historicalData]);

    // Auto-update historical data every 24 hours
    useEffect(() => {
        fetchHistoricalData();
        const interval = setInterval(() => {
            fetchHistoricalData();
        }, 24 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchHistoricalData]);

    // Initial fetch of consumer queries
    useEffect(() => {
        fetchConsumerQueries();
    }, [fetchConsumerQueries]);

    // Calculate the total predicted demand
    const totalPredictedDemand = predictions.reduce((sum, prediction) => {
        return sum + (prediction.predicted_demand || 0);
    }, 0);

    // Send alerts to consumers
    const sendAlertsToConsumers = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/send-alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(predictions),
            });
            if (response.ok) {
                alert('Alerts sent to consumers successfully!');
            }
        } catch (error) {
            console.error('Error sending alerts:', error);
        }
    };

    // Chart data for the last 24 hours
    const chartData = {
        labels: historicalData.slice(-24).map((d) => d.datetime),
        datasets: [
            {
                label: 'Predicted Demand',
                data: historicalData.slice(-24).map((d) => d.predicted_demand || 0),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Actual Demand',
                data: historicalData.slice(-24).map((d) => d.actual_demand || 0),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Add delete function
    const deleteQuery = async (queryId) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/delete-query/${queryId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setConsumerQueries(prev => prev.filter(q => q._id !== queryId));
            }
        } catch (error) {
            console.error('Error deleting query:', error);
        }
    };

    return (
        <div className="grid-operator-dashboard">
            <h1 className="heading">Grid Operator Dashboard</h1>

            {/* Historical Data Table */}
            <div className="dashboard-section historical-data">
                <h2>Historical Consumption</h2>
                <p className="section-description">
                    "The table displays historical electricity consumption data, highlighting actual demand, pricing trends, and designated peak hours."
                </p>
                <div className="table-container">
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
            </div>

            {/* Predictions Section */}
            <div className="dashboard-section predictions">
                <div className="predictions-header">
                    <h2>Demand, Price, and Peak Hour Predictions</h2>
                    <p className="section-description">
                        "Get ahead with predictive analytics! These vibrant cards unveil tomorrow's anticipated electricity demand, forecasted prices, and projected peak hours—where pricing adjusts by 20% to optimize consumption."
                    </p>
                </div>

                <div className="predictions-content">
                    <div className="predictions-container">
                        {predictions.map((prediction, index) => (
                            <div key={index} className="prediction-card">
                                <div className="prediction-content">
                                    <p className="time">
                                        <span>⏰</span>
                                        <strong>{prediction.datetime || 'N/A'}</strong>
                                    </p>
                                    <p className="demand">
                                        <span>📊</span>
                                        <span>Predicted Demand: <strong>{prediction.predicted_demand?.toFixed(2) || 'N/A'} MW</strong></span>
                                    </p>
                                    <p className="price">
                                        <span>💰</span>
                                        <span>Price: <strong>${prediction.Price?.toFixed(2) || 'N/A'}</strong></span>
                                    </p>
                                    <p className="peak-hour">
                                        {prediction.Peak_Hour ? (
                                            <>
                                                <span>⚠️</span>
                                                <span className="peak-yes">Peak Hour Alert!</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>✅</span>
                                                <span className="peak-no">Normal Hour</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {predictions.length > 0 && (
                        <div className="total-predicted-demand">
                            <p>
                                A total of <strong>{totalPredictedDemand.toFixed(2)} MW</strong> of electricity is required from the supplier.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Predict Next 24 Hours Button */}
            <div className="dashboard-section predict-button-section">
                <p className="section-description">
                    To forecast demand, prices, and peak hours for the next 24 hours, click below!
                </p>
                <button className="more-btn" onClick={fetchPredictions} disabled={isFetchingPredictions}>
                    {isFetchingPredictions ? 'Generating...' : 'Generate Forecast for Next 24 Hours'}
                </button>
                {shouldUpdateHistoricalTable && (
                    <div className="notification-box">
                        <p className="notification-text">
                            previous day's actual consumption and other data have been added to the historical table.
                        </p>
                    </div>
                )}
            </div>

            {/* Chart Section */}
            <div className="dashboard-section chart-section">
                <h2>Predicted vs Actual Demand (Last 24 Hours)</h2>
                <p className="section-description">
                    "Dive into this dynamic graph that elegantly contrasts predicted and actual electricity demand from the past 24 hours, offering a clear lens into forecasting precision and opportunities for refinement."
                </p>
                <div className="chart-container">
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    stacked: false,
                                    title: { display: true, text: 'Time' },
                                    ticks: {
                                        autoSkip: false,
                                        maxRotation: 45,
                                        minRotation: 45,
                                        callback: function (value, index, values) {
                                            if (index % 2 === 0) {
                                                return historicalData.slice(-24)[index].datetime;
                                            }
                                            return '';
                                        }
                                    },
                                    grid: { display: false }
                                },
                                y: {
                                    stacked: false,
                                    title: { display: true, text: 'Demand (MW)' },
                                    beginAtZero: true,
                                    ticks: {
                                        stepSize: 500,
                                        callback: (value) => `${value} MW`,
                                    },
                                },
                            },
                            plugins: {
                                legend: { position: 'top' },
                                tooltip: {
                                    enabled: true,
                                    callbacks: {
                                        label: (context) => {
                                            const label = context.dataset.label || '';
                                            const value = context.raw || 0;
                                            return `${label}: ${value.toFixed(2)} MW`;
                                        },
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {/* Anomaly Status Section */}
            <div className="dashboard-section anomaly-section">
                <h3>Anomaly Detection Status</h3>
                <div className="anomaly-card">
                    <p className="anomaly-status">Status: <strong>{anomalyStatus}</strong></p>
                    <p className="anomaly-description">
                        Anomaly detection identifies significant discrepancies between predicted and actual demand.
                        A threshold of 100 MW is used to detect anomalies.
                    </p>
                </div>
            </div>

            {/* Send Alerts Section */}
            <div className="dashboard-section send-alerts-section">
                <h3>Consumer Notification</h3>
                <button className="more-btn alert-btn" onClick={sendAlertsToConsumers}>
                    Send Alerts to Consumers
                </button>
                <p className="alert-description">
                    Notify consumers about upcoming peak hours and price changes based on the latest predictions.
                </p>
            </div>

            {/* Consumer Queries Section */}
            <div className="dashboard-section consumer-queries">
                <h2>Consumer Queries</h2>
                <div className="query-controls">
                    <button
                        onClick={fetchConsumerQueries}
                        className="refresh-btn"
                        disabled={isLoadingQueries}
                    >
                        {isLoadingQueries ? 'Refreshing...' : 'Refresh Queries'}
                    </button>
                    <span className="query-count">
                        {consumerQueries.length} {consumerQueries.length === 1 ? 'query' : 'queries'}
                    </span>
                </div>


                <div className="queries-container">
                    {consumerQueries.map((query) => (
                        <div key={query._id} className="query-card">
                            <div className="query-header">
                                <div>
                                    <span className="consumer-name">{query.user_name}</span>
                                    {query.user_email && (
                                        <span className="consumer-email"> ({query.user_email})</span>
                                    )}
                                </div>
                                <div className="query-actions">
                                    <button
                                        onClick={() => markQueryAsRead(query._id)}
                                        className="status-btn"
                                    >
                                        Mark as Read
                                    </button>
                                    <button
                                        onClick={() => deleteQuery(query._id)}
                                        className="delete-btn"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="query-time">
                                {new Date(query.timestamp).toLocaleString()}
                            </div>
                            <div className="query-content">
                                <p>{query.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GridOperatorDashboard;