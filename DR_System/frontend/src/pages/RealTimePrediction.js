import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "../components/ui/card";

const RealTimePrediction = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Connect to the Server-Sent Events (SSE) endpoint
        const eventSource = new EventSource('http://localhost:5000/api/predict');

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data); // Parse the JSON data
            if (data === '[END]') {
                eventSource.close(); // Close the connection if the stream ends
            } else {
                // Add the new prediction to the messages state
                setMessages((prev) => [...prev, data]);
            }
        };

        eventSource.onerror = () => {
            console.error('Error with event source');
            eventSource.close(); // Close the connection on error
        };

        // Cleanup function to close the connection when the component unmounts
        return () => eventSource.close();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Real-Time Predictions</h1>
            <div className="space-y-2">
                {messages.map((msg, index) => (
                    <Card key={index}>
                        <CardContent>
                            <p><strong>Time:</strong> {msg.datetime}</p>
                            <p><strong>Predicted Demand:</strong> {msg.predicted_demand.toFixed(2)} MW</p>
                            <p><strong>Actual Demand:</strong> {msg.actual_demand.toFixed(2)} MW</p>
                            <p><strong>Price:</strong> ${msg.Price.toFixed(2)}</p>
                            <p><strong>Peak Hour:</strong> {msg.Peak_Hour ? "Yes ⚠️" : "No ✅"}</p>
                            <p><strong>Alert:</strong> {msg.alert_message}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default RealTimePrediction;