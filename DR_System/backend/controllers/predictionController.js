const { PythonShell } = require('python-shell');
const { spawn } = require('child_process');
const path = require('path');

// Function to run real-time predictions
const runRealTimePrediction = (req, res) => {
    console.log("Prediction request received");

    const scriptPath = path.join(__dirname, '../../src/real_time_prediction.py');
    console.log("Script path:", scriptPath);

    // Set up Server-Sent Events (SSE) headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const options = {
        pythonPath: 'python', 
        scriptPath: path.dirname(scriptPath),
        pythonOptions: ['-u'], // '-u' for unbuffered output (real-time)
    };

    const pyshell = new PythonShell(path.basename(scriptPath), options);

    pyshell.on('message', (message) => {
        console.log('Python script output:', message);

        if (message === '[END]') {
            res.write('event: end\n');
            res.write('data: [END]\n\n');
            res.end();
        } else {
            res.write('event: prediction\n');
            res.write(`data: ${message}\n\n`);
        }
    });

    pyshell.on('error', (err) => {
        console.error('Python script error:', err);
        res.write('event: error\n');
        res.write('data: Error running prediction script\n\n');
        res.end();
    });

    pyshell.on('close', (code) => {
        console.log('Python script finished with code', code);
        res.write('event: end\n');
        res.write('data: [END]\n\n');
        res.end();
    });
};

// Function to fetch historical data
const fetchHistoricalData = async (req, res) => {
    try {
        // Logic to fetch historical data from your dataset or database
        const historicalData = []; 
        res.status(200).json(historicalData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching historical data', error });
    }
};

// Function to fetch actual data for the last 24 hours
const fetchActualDataRange = async (req, res) => {
    try {
        // Logic to fetch actual data for the last 24 hours
        const actualData = []; 
        res.status(200).json(actualData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching actual data range', error });
    }
};

// Function to send alerts to consumers
const sendAlertsToConsumers = async (req, res) => {
    try {
        const predictions = req.body; // Predictions sent from the frontend
        // Logic to send alerts to consumers (e.g., save to database)
        res.status(200).json({ message: 'Alerts sent to consumers successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending alerts', error });
    }
};

module.exports = {
    runRealTimePrediction,
    fetchHistoricalData,
    fetchActualDataRange,
    sendAlertsToConsumers,
};