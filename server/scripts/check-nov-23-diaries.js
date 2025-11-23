require('dotenv').config();
const mongoose = require('mongoose');
const Diary = require('../models/Diary');
const User = require('../models/User');

// MongoDB 연결
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindmirror';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 연결 성공\n');
  } catch (error) {
    console.error('❌ MongoDB 연결 오류:', error);
    process.exit(1);
  }
};

async function checkNov23Diaries() {
  try {
    await connectDB();

    // 모든 사용자 조회
    const users = await User.find({});
    console.log(`👤 총 ${users.length}명의 사용자 발견\n`);

    for (const user of users) {
      console.log(`\n📋 사용자: ${user.nickname} (${user._id})`);
      
      // 11월 23일의 모든 일기 조회
      const nov23Start = new Date('2024-11-23T00:00:00.000Z');
      const nov23End = new Date('2024-11-23T23:59:59.999Z');
      
      const diaries = await Diary.find({
        userId: user._id,
        date: {
          $gte: nov23Start,
          $lte: nov23End,
        },
      }).sort({ createdAt: -1 });

      console.log(`  📅 11월 23일 일기 개수: ${diaries.length}개`);

      if (diaries.length > 0) {
        diaries.forEach((diary, index) => {
          console.log(`\n  [${index + 1}] 일기 ID: ${diary._id}`);
          console.log(`      타입: ${diary.recordType}`);
          console.log(`      날짜: ${diary.date}`);
          console.log(`      감정: ${diary.emotion} ${diary.emotionEmoji || ''}`);
          console.log(`      요약: ${diary.summary?.substring(0, 50) || '없음'}...`);
          console.log(`      내용 (처음 100자): ${diary.content?.substring(0, 100) || '없음'}...`);
          console.log(`      생성일: ${diary.createdAt}`);
          
          // "과제" 또는 "우울" 키워드가 있는지 확인
          if (diary.content && (diary.content.includes('과제') || diary.content.includes('우울'))) {
            console.log(`      ⚠️ "과제" 또는 "우울" 키워드 발견!`);
          }
        });
      }

      // content가 있는 일기만 조회 (getAllDiaries와 동일한 조건)
      const diariesWithContent = await Diary.find({
        userId: user._id,
        date: {
          $gte: nov23Start,
          $lte: nov23End,
        },
        content: { $exists: true, $ne: '' },
      }).sort({ createdAt: -1 });

      console.log(`  📅 11월 23일 일기 (content 있음): ${diariesWithContent.length}개`);
    }

    // 전체 일기 개수 확인
    const allDiaries = await Diary.find({});
    console.log(`\n📚 전체 일기 개수: ${allDiaries.length}개`);

    // 11월 23일 전체 일기 개수
    const allNov23Diaries = await Diary.find({
      date: {
        $gte: nov23Start,
        $lte: nov23End,
      },
    });
    console.log(`📅 11월 23일 전체 일기 개수 (모든 사용자): ${allNov23Diaries.length}개`);

    await mongoose.connection.close();
    console.log('\n✅ 완료');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error);
    console.error('에러 상세:', error.message, error.stack);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

checkNov23Diaries();

