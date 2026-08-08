const mongoose = require('mongoose');
require('dotenv').config();
//mongoose 7
mongoose.set('strictQuery', false); 

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5 second timeout
            socketTimeoutMS: 30000, // 30 second socket timeout
            connectTimeoutMS: 10000 // 10 second connection timeout
        });
        console.log('MongoDB Atlas Connected Successfully!');
    } catch (error) {
        console.error('\n⚠️ MongoDB connection failed:', error.message);
        console.log('\n👉 ACTION REQUIRED:');
        console.log('1. Go to https://cloud.mongodb.com');
        console.log('2. Navigate to: Network Access');
        console.log('3. Click "Add IP Address"');
        console.log('4. Add your current IP or "0.0.0.0/0" (temporary)');
        console.log('5. Verify database user has correct permissions\n');
        process.exit(1);
    }
};

module.exports = connectDB;