const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is provided
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  No MONGODB_URI found in environment variables');
      console.log('📝 Running in test mode without MongoDB');
      console.log('🔧 To enable database: Add MONGODB_URI to .env file');
      return false;
    }

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ Connected to MongoDB Atlas: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection state: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('📝 Falling back to test mode without MongoDB');
    console.log('🔧 Check your MONGODB_URI in .env file');
    return false;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔌 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB Atlas');
});

// Graceful close on app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;