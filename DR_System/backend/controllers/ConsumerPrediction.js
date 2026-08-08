const Query = require('../models/Query');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const sanitize = require('mongo-sanitize');

// Rate limiting for query submission
const queryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many query submissions, please try again later'
});

// Secure consumer prediction stream
const runConsumerPrediction = async (req, res) => {
    try {
        console.log('Secure consumer prediction request received');
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // Secure data generation
        for (let i = 0; i < 5; i++) {
            const safeData = {
                time: new Date().toISOString(),
                demand: Math.random().toFixed(2),
                price: (Math.random() * 10).toFixed(2),
                peakHour: i % 2 === 0
            };
            res.write(`data: ${JSON.stringify(safeData)}\n\n`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        res.end();
    } catch (error) {
        console.error('Secure prediction error:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Secure query submission
const submitConsumerQuery = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        // Input sanitization
        const cleanQuery = sanitize(req.body.query);
        const consumerId = sanitize(req.user.id);

        if (!cleanQuery || cleanQuery.length > 500) {
            throw new Error('Invalid query content');
        }

        const newQuery = new Query({
            consumerId,
            query: cleanQuery
        });

        await newQuery.save({ session });
        
        // Minimal user data exposure
        const consumer = await User.findById(consumerId)
            .select('name email')
            .session(session)
            .lean();

        await session.commitTransaction();
        
        // Secure real-time update
        req.app.get('io').to('operators').emit('new-query', {
            id: newQuery._id,
            query: newQuery.query,
            status: newQuery.status,
            timestamp: newQuery.timestamp,
            consumer: {
                name: consumer.name,
                email: consumer.email
            }
        });

        res.status(201).json({
            success: true,
            message: 'Query submitted securely'
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Secure query error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Secure submission failed',
            error: error.message 
        });
    } finally {
        session.endSession();
    }
};

// Secure query retrieval
const getConsumerQueries = async (req, res) => {
    try {
        const queries = await Query.find()
            .populate('consumerId', 'name email -_id')
            .sort({ timestamp: -1 })
            .lean()
            .maxTimeMS(2000)
            .select('-__v');

        res.status(200).json({
            success: true,
            count: queries.length,
            data: queries
        });
    } catch (error) {
        console.error('Secure fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to securely fetch queries'
        });
    }
};

module.exports = {
    runConsumerPrediction,
    fetchAlerts: queryLimiter, // Protected alerts endpoint
    submitConsumerQuery: [queryLimiter, submitConsumerQuery],
    getConsumerQueries
};