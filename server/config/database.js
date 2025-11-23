const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindmirror';
    console.log(`🔌 Attempting to connect to MongoDB...`);
    console.log(`📍 URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // 비밀번호 숨김
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Port: ${conn.connection.port}`);
    
    // 연결 이벤트 리스너
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('   Please check:');
    console.error('   1. MongoDB is running');
    console.error('   2. MONGODB_URI in .env file is correct');
    console.error('   3. Network connectivity');
    process.exit(1);
  }
};

module.exports = connectDB;



