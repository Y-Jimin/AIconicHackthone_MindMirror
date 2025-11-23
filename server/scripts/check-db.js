/**
 * MongoDB 연결 상태 확인 스크립트
 * 사용법: node scripts/check-db.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const checkDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindmirror';
    
    console.log('🔍 Checking MongoDB connection...');
    console.log(`📍 URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    console.log('');

    // 연결 시도
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('');
    console.log('📊 Connection Details:');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Port: ${mongoose.connection.port}`);
    console.log(`   Ready State: ${mongoose.connection.readyState} (1 = connected)`);
    console.log('');

    // 컬렉션 목록 확인
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:');
    if (collections.length > 0) {
      collections.forEach((col) => {
        console.log(`   - ${col.name}`);
      });
    } else {
      console.log('   (no collections found)');
    }
    console.log('');

    // User 모델 테스트
    try {
      const User = require('../models/User');
      const userCount = await User.countDocuments();
      console.log(`👤 Users: ${userCount}`);
    } catch (err) {
      console.log('⚠️  Could not check User model:', err.message);
    }

    // Diary 모델 테스트
    try {
      const Diary = require('../models/Diary');
      const diaryCount = await Diary.countDocuments();
      console.log(`📝 Diaries: ${diaryCount}`);
    } catch (err) {
      console.log('⚠️  Could not check Diary model:', err.message);
    }

    console.log('');
    console.log('✅ Database check completed!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Database connection failed!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Check if MongoDB is running:');
    console.error('      - Windows: Check Services or run "mongod"');
    console.error('      - Mac/Linux: run "brew services start mongodb-community" or "sudo systemctl start mongod"');
    console.error('');
    console.error('   2. Verify MONGODB_URI in .env file:');
    console.error('      - Local: mongodb://localhost:27017/mindmirror');
    console.error('      - Atlas: mongodb+srv://username:password@cluster.mongodb.net/mindmirror');
    console.error('');
    console.error('   3. Check network connectivity');
    console.error('   4. Verify MongoDB credentials (if using Atlas)');
    
    process.exit(1);
  }
};

checkDatabase();

