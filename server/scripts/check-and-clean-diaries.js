/**
 * 일기 데이터 확인 및 짧은 일기 삭제 스크립트
 * 사용법: node scripts/check-and-clean-diaries.js
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
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// 일기 데이터 확인 및 정리
const checkAndCleanDiaries = async () => {
  try {
    await connectDB();

    console.log('\n📊 일기 데이터 확인 중...\n');

    // 모든 일기 조회
    const allDiaries = await Diary.find({}).sort({ createdAt: -1 });
    console.log(`총 일기 개수: ${allDiaries.length}개\n`);

    // 일기 내용 길이별 분류
    const shortDiaries = []; // 100자 이하
    const mediumDiaries = []; // 101-200자
    const longDiaries = []; // 201자 이상

    allDiaries.forEach(diary => {
      const contentLength = diary.content ? diary.content.trim().length : 0;
      if (contentLength <= 100) {
        shortDiaries.push({ ...diary.toObject(), contentLength });
      } else if (contentLength <= 200) {
        mediumDiaries.push({ ...diary.toObject(), contentLength });
      } else {
        longDiaries.push({ ...diary.toObject(), contentLength });
      }
    });

    console.log('📏 일기 길이별 분류:');
    console.log(`   짧은 일기 (100자 이하): ${shortDiaries.length}개`);
    console.log(`   중간 일기 (101-200자): ${mediumDiaries.length}개`);
    console.log(`   긴 일기 (201자 이상): ${longDiaries.length}개\n`);

    // 짧은 일기 상세 정보
    if (shortDiaries.length > 0) {
      console.log('📝 짧은 일기 목록 (100자 이하):');
      shortDiaries.slice(0, 10).forEach((diary, idx) => {
        const dateStr = diary.date ? new Date(diary.date).toISOString().split('T')[0] : '날짜 없음';
        const preview = diary.content ? diary.content.substring(0, 50) : '내용 없음';
        console.log(`   ${idx + 1}. ${dateStr} (${diary.contentLength}자) - ${preview}...`);
      });
      if (shortDiaries.length > 10) {
        console.log(`   ... 외 ${shortDiaries.length - 10}개`);
      }
      console.log('');
    }

    // 사용자별 일기 개수
    const userDiaryCounts = {};
    allDiaries.forEach(diary => {
      const userId = diary.userId.toString();
      if (!userDiaryCounts[userId]) {
        userDiaryCounts[userId] = { total: 0, short: 0, long: 0 };
      }
      userDiaryCounts[userId].total++;
      const contentLength = diary.content ? diary.content.trim().length : 0;
      if (contentLength <= 100) {
        userDiaryCounts[userId].short++;
      } else {
        userDiaryCounts[userId].long++;
      }
    });

    console.log('👤 사용자별 일기 통계:');
    for (const [userId, counts] of Object.entries(userDiaryCounts)) {
      try {
        const user = await User.findById(userId);
        const userName = user ? user.nickname : '알 수 없음';
        console.log(`   ${userName} (${userId.substring(0, 8)}...):`);
        console.log(`      전체: ${counts.total}개, 짧은 일기: ${counts.short}개, 긴 일기: ${counts.long}개`);
      } catch (err) {
        console.log(`   사용자 ID ${userId.substring(0, 8)}...: ${counts.total}개`);
      }
    }
    console.log('');

    // 짧은 일기 삭제 여부 확인
    if (shortDiaries.length > 0) {
      console.log(`\n🗑️  짧은 일기 ${shortDiaries.length}개를 삭제하시겠습니까?`);
      console.log('   (이 스크립트는 자동으로 삭제하지 않습니다)');
      console.log('   삭제하려면 아래 명령어를 실행하세요:');
      console.log(`   node scripts/check-and-clean-diaries.js --delete\n`);
      
      // --delete 플래그가 있으면 삭제 실행
      if (process.argv.includes('--delete')) {
        console.log('🗑️  짧은 일기 삭제 중...');
        const shortDiaryIds = shortDiaries.map(d => d._id);
        const result = await Diary.deleteMany({ _id: { $in: shortDiaryIds } });
        console.log(`✅ ${result.deletedCount}개의 짧은 일기가 삭제되었습니다.\n`);
        
        // 삭제 후 통계
        const remainingDiaries = await Diary.countDocuments();
        console.log(`📊 남은 일기 개수: ${remainingDiaries}개`);
      }
    } else {
      console.log('✅ 짧은 일기가 없습니다. 모든 일기가 충분한 길이입니다.\n');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

checkAndCleanDiaries();

