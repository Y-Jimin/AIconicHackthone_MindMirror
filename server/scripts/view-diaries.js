/**
 * 일기 내용 확인 스크립트
 * 사용법: node scripts/view-diaries.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Diary = require('../models/Diary');

// MongoDB 연결
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindmirror';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected\n');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// 일기 내용 확인
const viewDiaries = async () => {
  try {
    await connectDB();

    // 모든 일기 조회 (날짜순)
    const allDiaries = await Diary.find({}).sort({ date: -1 });
    console.log(`📊 총 일기 개수: ${allDiaries.length}개\n`);

    // 사용자 정보 가져오기
    const userIds = [...new Set(allDiaries.map(d => d.userId.toString()))];
    const users = {};
    for (const userId of userIds) {
      try {
        const user = await User.findById(userId);
        if (user) {
          users[userId] = user.nickname;
        }
      } catch (err) {
        // 무시
      }
    }

    console.log('📝 일기 목록 (최근 20개):\n');
    allDiaries.slice(0, 20).forEach((diary, idx) => {
      const dateStr = diary.date ? new Date(diary.date).toISOString().split('T')[0] : '날짜 없음';
      const userName = users[diary.userId.toString()] || '알 수 없음';
      const contentLength = diary.content ? diary.content.trim().length : 0;
      const preview = diary.content ? diary.content.substring(0, 100).replace(/\n/g, ' ') : '내용 없음';
      const emotion = diary.emotion || '분석 없음';
      const emotionScore = diary.emotionScore || 0;
      
      console.log(`${idx + 1}. [${dateStr}] ${userName}`);
      console.log(`   감정: ${emotion} (${emotionScore}점)`);
      console.log(`   길이: ${contentLength}자`);
      console.log(`   내용: ${preview}...`);
      console.log('');
    });

    if (allDiaries.length > 20) {
      console.log(`... 외 ${allDiaries.length - 20}개\n`);
    }

    // 통계
    const avgLength = allDiaries.reduce((sum, d) => sum + (d.content ? d.content.trim().length : 0), 0) / allDiaries.length;
    const minLength = Math.min(...allDiaries.map(d => d.content ? d.content.trim().length : 0));
    const maxLength = Math.max(...allDiaries.map(d => d.content ? d.content.trim().length : 0));

    console.log('📊 통계:');
    console.log(`   평균 길이: ${Math.round(avgLength)}자`);
    console.log(`   최소 길이: ${minLength}자`);
    console.log(`   최대 길이: ${maxLength}자`);
    console.log('');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

viewDiaries();

