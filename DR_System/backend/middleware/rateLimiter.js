const rateLimit = require('express-rate-limit');

// Basic rate limiting middleware
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
    return rateLimit({
        windowMs, // 15 minutes
        max,      // Limit each IP to 100 requests per window
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Too many requests from this IP, please try again later'
    });
};

module.exports = { createRateLimiter };