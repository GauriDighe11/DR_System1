const jwt = require('jsonwebtoken');

const operatorAuthMiddleware = (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            throw new Error('Authentication error: No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Only allow users with 'operator' role
        if (decoded.role !== 'operator') {
            throw new Error('Authentication error: Operator role required');
        }

        socket.user = decoded;
        next();
    } catch (err) {
        next(new Error(`Authentication failed: ${err.message}`));
    }
};

module.exports = operatorAuthMiddleware;