const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const { runRealTimePrediction, fetchHistoricalData, fetchActualDataRange, sendAlertsToConsumers } = require('../controllers/predictionController');
const { runConsumerPrediction, fetchAlerts, submitConsumerQuery, getConsumerQueries } = require('../controllers/ConsumerPrediction');

// User Signup
router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Prediction Routes
router.get('/predict', runRealTimePrediction);
router.get('/api/consumer-predict', runConsumerPrediction);

// Historical Data Route
router.get('/api/historical-data', fetchHistoricalData);

// Actual Data Range Route
router.get('/api/actual-data-range', fetchActualDataRange);

// Send Alerts Route
router.post('/api/send-alerts', sendAlertsToConsumers);

// Fetch Alerts Route
router.get('/api/alerts', fetchAlerts);

// Submit Consumer Query Route (protected)
router.post('/api/submit-query', authMiddleware, submitConsumerQuery);

// Get Consumer Queries Route (protected)
router.get('/api/get-queries', authMiddleware, getConsumerQueries);

module.exports = router;