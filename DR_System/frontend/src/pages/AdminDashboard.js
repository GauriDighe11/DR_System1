import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { Card } from '../components/ui/card';
import axios from 'axios';
import { Button } from '../components/ui/button';
import RealTimePrediction from '../pages/RealTimePrediction';

const AdminDashboard = () => {
    const [predictions, setPredictions] = useState([]);
    const [isPredicting, setIsPredicting] = useState(false);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        fetchPredictions();
    }, []);

    const fetchPredictions = () => {
        setIsPredicting(true);
        const eventSource = new EventSource('http://localhost:5000/api/predict');
        eventSource.onmessage = (event) => {
            setPredictions((prev) => [...prev, event.data]);
        };
        eventSource.onerror = () => {
            eventSource.close();
            setIsPredicting(false);
        };
    };

    const handleMorePredictions = () => {
        setShowMore(true);
        console.log('Requesting more predictions...');
    };

    return (
        <div className="admin-dashboard">
            <h1 className="heading">Admin Dashboard</h1>
            <div className="predictions">
                {predictions.slice(0, showMore ? predictions.length : 24).map((prediction, index) => (
                    <Card key={index} className="prediction-card">
                        <p>{prediction}</p>
                    </Card>
                ))}
            </div>
            {!showMore && predictions.length >= 24 && (
                <Button onClick={handleMorePredictions} className="more-btn">
                    Show More Predictions
                </Button>
            )}
        </div>
    );
};

export default AdminDashboard;
