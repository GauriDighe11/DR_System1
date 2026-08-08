const express = require('express');
const router = express.Router();
const { submitConsumerQuery, getConsumerQueries } = require('../controllers/ConsumerPrediction');
const authMiddleware = require('../middleware/authMiddleware'); // Use yer EXISTING auth

router.post('/submit', authMiddleware, submitConsumerQuery);
router.get('/', authMiddleware, getConsumerQueries);

module.exports = router;