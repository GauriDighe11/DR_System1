require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const mongoose = require('mongoose');
// Add this before any other code

mongoose.set('strictQuery', false); // Fixes the deprecation warning

// Initialize Express (keep yer original setup)
const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// Connect to DB (no changes here)
connectDB();

// HTTP Server (keep as was)
const server = http.createServer(app);

// Socket.IO Setup (MINIMAL changes)
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Yer original auth routes (untouched)
app.use('/api/auth', authRoutes);

// Add query endpoints
const queryRoutes = require('./routes/queryRoutes');
app.use('/api/queries', queryRoutes);

// Socket.IO connection (basic)
io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start server (original)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server runnin' on port ${PORT}`);
});