/**
 * 목업 데이터 생성 스크립트
 * 사용법: 
 *   node scripts/generate-mock-data.js                    (모든 사용자에게 생성)
 *   node scripts/generate-mock-data.js <userId>          (특정 사용자에게 생성)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Diary = require('../models/Diary');
const Chat = require('../models/Chat');

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

// 목업 데이터 생성
const generateMockData = async (targetUserId = null) => {
  try {
    await connectDB();

    let users = [];
    
    if (targetUserId) {
      // 특정 사용자 ID로 찾기
      const user = await User.findById(targetUserId);
      if (user) {
        users = [user];
        console.log(`👤 특정 사용자 사용: ${user._id} (${user.nickname})`);
      } else {
        console.error(`❌ 사용자 ID ${targetUserId}를 찾을 수 없습니다.`);
        process.exit(1);
      }
    } else {
      // 모든 사용자에게 목업 데이터 생성 (또는 가장 최근 사용자)
      users = await User.find().sort({ createdAt: -1 });
      if (users.length === 0) {
        console.log('👤 사용자가 없습니다. 새 사용자를 생성합니다...');
        const newUser = new User({ nickname: '사용자' });
        await newUser.save();
        users = [newUser];
        console.log('👤 새 사용자 생성:', newUser._id);
      } else {
        console.log(`👤 ${users.length}명의 사용자에게 목업 데이터를 생성합니다.`);
        // 가장 최근 사용자만 사용하도록 변경 (원하면 주석 해제)
        // users = [users[0]];
        // console.log(`👤 가장 최근 사용자 사용: ${users[0]._id} (${users[0].nickname})`);
      }
    }

    // 각 사용자에게 목업 데이터 생성
    for (const user of users) {
      const userId = user._id;
      console.log(`\n📝 사용자 ${user.nickname} (${userId})에게 목업 데이터 생성 중...`);
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

    // 현재 월의 여러 날짜에 일기 생성
    const generateCurrentMonthEntries = () => {
      const entries = [];
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      // 현재 월의 다양한 날짜에 일기 생성 (약 15-20개)
      const diaryDates = [
        1, 2, 4, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 30
      ].filter(day => day <= daysInMonth);

      const diaryContents = [
        { content: '오늘은 날씨가 정말 좋았다. 친구들과 함께 공원에 나가서 피크닉을 했다. 햇살이 따뜻하고 바람도 시원해서 정말 기분이 좋았다.', emotion: 'Happy', emoji: '😊', score: 85, keywords: [], summary: '친구들과 공원 피크닉' },
        { content: '오늘은 시험이 있어서 많이 긴장했다. 공부를 열심히 했지만 아직 부족한 부분이 많은 것 같다. 내일도 더 열심히 해야겠다.', emotion: 'Anxious', emoji: '😰', score: 35, keywords: ['시험', '공부'], summary: '시험으로 인한 긴장' },
        { content: '오늘은 팀 프로젝트 발표가 있었다. 준비를 많이 했지만 발표 중에 실수를 해서 아쉬웠다. 하지만 팀원들이 잘 도와줘서 무사히 마칠 수 있었다.', emotion: 'Neutral', emoji: '😐', score: 55, keywords: ['프로젝트'], summary: '팀 프로젝트 발표' },
        { content: '오늘은 오랜만에 가족들과 함께 저녁을 먹었다. 엄마가 만든 음식이 정말 맛있었고, 가족들과 이야기하는 시간이 즐거웠다.', emotion: 'Happy', emoji: '😊', score: 90, keywords: [], summary: '가족과의 즐거운 저녁' },
        { content: '오늘은 비가 와서 기분이 좀 우울했다. 밖에 나가고 싶었는데 비 때문에 집에만 있어야 해서 답답했다.', emotion: 'Sad', emoji: '😢', score: 40, keywords: [], summary: '비 오는 날의 우울' },
        { content: '오늘은 운동을 했다. 오랜만에 땀을 흘리니 기분이 좋았다. 운동 후에는 항상 기분이 상쾌해지는 것 같다.', emotion: 'Happy', emoji: '😊', score: 75, keywords: [], summary: '운동 후 상쾌한 기분' },
        { content: '오늘은 새로운 책을 읽기 시작했다. 책 내용이 흥미로워서 계속 읽고 싶었지만 시간이 부족했다.', emotion: 'Happy', emoji: '😊', score: 70, keywords: [], summary: '새로운 책 읽기' },
        { content: '오늘은 친구와 싸웠다. 작은 일이었지만 기분이 나빴다. 내일은 친구에게 먼저 연락해서 화해해야겠다.', emotion: 'Sad', emoji: '😢', score: 35, keywords: ['인간관계'], summary: '친구와의 다툼' },
        { content: '오늘은 프로젝트를 완성했다. 오랜 시간 동안 준비한 프로젝트라서 완성했을 때 정말 뿌듯했다.', emotion: 'Happy', emoji: '😊', score: 88, keywords: [], summary: '프로젝트 완성' },
        { content: '오늘은 피곤했다. 일이 많아서 쉴 시간이 없었다. 내일은 좀 더 여유롭게 보내고 싶다.', emotion: 'Stressed', emoji: '😠', score: 40, keywords: ['일', '피로'], summary: '피곤하고 바쁜 하루' },
        { content: '오늘은 날씨가 추웠다. 겨울이 다가오는 것 같다. 따뜻한 옷을 입고 나가야겠다.', emotion: 'Neutral', emoji: '😐', score: 50, keywords: [], summary: '추워지는 날씨' },
        { content: '오늘은 오랜만에 친구를 만났다. 오랜만에 만나서 이야기를 나누니 정말 즐거웠다. 시간이 금방 지나간 것 같다.', emotion: 'Happy', emoji: '😊', score: 82, keywords: [], summary: '친구와의 만남' },
        { content: '오늘은 새로운 취미를 시작했다. 처음 해보는 것이라 어려웠지만 재미있었다. 계속 연습해서 잘하고 싶다.', emotion: 'Happy', emoji: '😊', score: 78, keywords: [], summary: '새로운 취미 시작' },
        { content: '오늘은 산책을 했다. 신선한 공기를 마시니 기분이 좋았다. 자연 속에서 시간을 보내니 마음이 편안해졌다.', emotion: 'Happy', emoji: '😊', score: 85, keywords: [], summary: '산책으로 기분 전환' },
        { content: '오늘은 요리를 했다. 새로운 레시피를 시도했는데 생각보다 잘 되었다. 다음에도 더 도전해보고 싶다.', emotion: 'Happy', emoji: '😊', score: 72, keywords: [], summary: '새로운 요리 시도' },
        { content: '오늘은 영화를 봤다. 재미있는 영화였고 시간 가는 줄 몰랐다. 다음에도 좋은 영화를 보고 싶다.', emotion: 'Happy', emoji: '😊', score: 80, keywords: [], summary: '영화 관람' },
        { content: '오늘은 집에서 푹 쉬었다. 아무것도 하지 않고 쉬니 정말 좋았다. 가끔은 이런 시간이 필요하다.', emotion: 'Neutral', emoji: '😐', score: 60, keywords: [], summary: '집에서 푹 쉬기' },
      ];

      diaryDates.forEach((day, index) => {
        const content = diaryContents[index % diaryContents.length];
        entries.push({
          userId,
          date: new Date(currentYear, currentMonth, day),
          recordType: 'text',
          content: content.content,
          emotion: content.emotion,
          emotionEmoji: content.emoji,
          emotionScore: content.score,
          stressKeywords: content.keywords,
          summary: content.summary,
        });
      });

      return entries;
    };

    // 이전 월의 일기들도 일부 생성
    const generatePreviousMonthEntries = () => {
      const entries = [];
      const prevMonth = currentMonth - 1;
      const prevYear = prevMonth < 0 ? currentYear - 1 : currentYear;
      const actualPrevMonth = prevMonth < 0 ? 11 : prevMonth;
      const daysInPrevMonth = new Date(prevYear, actualPrevMonth + 1, 0).getDate();
      
      // 이전 월의 일부 날짜에 일기 생성
      const prevMonthDates = [5, 10, 15, 20, 25].filter(day => day <= daysInPrevMonth);
      
      const prevMonthContents = [
        { content: '오늘은 팀 프로젝트 발표가 있었다. 준비를 많이 했지만 발표 중에 실수를 해서 아쉬웠다.', emotion: 'Neutral', emoji: '😐', score: 55, keywords: ['프로젝트'], summary: '팀 프로젝트 발표' },
        { content: '오늘은 오랜만에 가족들과 함께 저녁을 먹었다. 엄마가 만든 음식이 정말 맛있었고, 가족들과 이야기하는 시간이 즐거웠다.', emotion: 'Happy', emoji: '😊', score: 90, keywords: [], summary: '가족과의 즐거운 저녁' },
        { content: '오늘은 비가 와서 기분이 좀 우울했다. 밖에 나가고 싶었는데 비 때문에 집에만 있어야 해서 답답했다.', emotion: 'Sad', emoji: '😢', score: 40, keywords: [], summary: '비 오는 날의 우울' },
        { content: '오늘은 운동을 했다. 오랜만에 땀을 흘리니 기분이 좋았다. 운동 후에는 항상 기분이 상쾌해지는 것 같다.', emotion: 'Happy', emoji: '😊', score: 75, keywords: [], summary: '운동 후 상쾌한 기분' },
        { content: '오늘은 새로운 책을 읽기 시작했다. 책 내용이 흥미로워서 계속 읽고 싶었지만 시간이 부족했다.', emotion: 'Happy', emoji: '😊', score: 70, keywords: [], summary: '새로운 책 읽기' },
      ];

      prevMonthDates.forEach((day, index) => {
        const content = prevMonthContents[index % prevMonthContents.length];
        entries.push({
          userId,
          date: new Date(prevYear, actualPrevMonth, day),
          recordType: 'text',
          content: content.content,
          emotion: content.emotion,
          emotionEmoji: content.emoji,
          emotionScore: content.score,
          stressKeywords: content.keywords,
          summary: content.summary,
        });
      });

      return entries;
    };

      // 일기 목업 데이터 생성
      const currentMonthEntries = generateCurrentMonthEntries();
      const previousMonthEntries = generatePreviousMonthEntries();
      
      const diaryEntries = [
        ...currentMonthEntries,
        ...previousMonthEntries,
      ];

      // 일기 데이터 저장
      console.log('\n📝 일기 목업 데이터 생성 중...');
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const entry of diaryEntries) {
      // 날짜 객체 복사 (원본 수정 방지)
      const entryDate = new Date(entry.date);
      const startOfDay = new Date(entryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(entryDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existing = await Diary.findOne({
        userId: entry.userId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      if (!existing) {
        const diary = new Diary({
          ...entry,
          date: entryDate,
        });
        await diary.save();
        console.log(`   ✓ ${entryDate.toISOString().split('T')[0]} - ${entry.summary}`);
        createdCount++;
      } else {
        console.log(`   - ${entryDate.toISOString().split('T')[0]} - 이미 존재 (건너뜀)`);
        skippedCount++;
      }
    }
    
      console.log(`\n   생성: ${createdCount}개, 건너뜀: ${skippedCount}개`);

      // Chat 목업 데이터 생성 (일부 세션)
      console.log('\n💬 Chat 목업 데이터 생성 중...');
      const sessionIds = [
      `session-${currentYear}-${currentMonth - 1}-08`,
      `session-${currentYear}-${currentMonth - 1}-18`,
      `session-${currentYear}-${currentMonth}-03`,
      `session-${currentYear}-${currentMonth}-12`,
    ];

    const chatMessages = [
      // 첫 번째 세션
      { sessionId: sessionIds[0], role: 'user', content: '오늘 하루가 정말 힘들었어요.' },
      { sessionId: sessionIds[0], role: 'assistant', content: '어떤 일이 있었나요? 이야기해주시면 듣고 싶어요.' },
      { sessionId: sessionIds[0], role: 'user', content: '과제가 너무 많아서 스트레스를 많이 받았어요.' },
      { sessionId: sessionIds[0], role: 'assistant', content: '과제가 많아서 부담이 되셨군요. 어떤 과제들이 있었나요?' },
      { sessionId: sessionIds[0], role: 'user', content: '프로그래밍 과제와 리포트를 동시에 해야 해서 시간이 부족했어요.' },
      { sessionId: sessionIds[0], role: 'assistant', content: '여러 과제를 동시에 하려니 시간이 부족하게 느껴지셨군요. 우선순위를 정해서 하나씩 해결해보는 건 어떨까요?' },
      // 두 번째 세션
      { sessionId: sessionIds[1], role: 'user', content: '요즘 잠을 잘 못 자고 있어요.' },
      { sessionId: sessionIds[1], role: 'assistant', content: '잠을 못 주무시는 이유가 있으신가요?' },
      { sessionId: sessionIds[1], role: 'user', content: '생각이 많아서 잠이 안 와요.' },
      { sessionId: sessionIds[1], role: 'assistant', content: '어떤 생각들이 떠오르시나요?' },
      { sessionId: sessionIds[1], role: 'user', content: '내일 할 일들과 걱정되는 일들이 계속 생각나요.' },
      { sessionId: sessionIds[1], role: 'assistant', content: '내일 할 일들이 걱정되시는군요. 일단 오늘은 푹 쉬시고, 내일 아침에 다시 생각해보시는 건 어떨까요?' },
      // 세 번째 세션
      { sessionId: sessionIds[2], role: 'user', content: '오늘 하루가 정말 행복했어요!' },
      { sessionId: sessionIds[2], role: 'assistant', content: '정말 좋은 하루였군요! 어떤 일이 있었나요?' },
      { sessionId: sessionIds[2], role: 'user', content: '좋은 소식을 들었어요.' },
      { sessionId: sessionIds[2], role: 'assistant', content: '축하드려요! 어떤 소식이었나요?' },
      { sessionId: sessionIds[2], role: 'user', content: '프로젝트가 성공적으로 완료되었다는 소식이었어요.' },
      { sessionId: sessionIds[2], role: 'assistant', content: '정말 기쁜 일이네요! 오랜 노력의 결과가 나온 것 같아요. 축하드려요!' },
      // 네 번째 세션
      { sessionId: sessionIds[3], role: 'user', content: '요즘 자신감이 없어요.' },
      { sessionId: sessionIds[3], role: 'assistant', content: '자신감이 없으시는 이유가 있으신가요?' },
      { sessionId: sessionIds[3], role: 'user', content: '뭘 해도 잘 안 되는 것 같아요.' },
      { sessionId: sessionIds[3], role: 'assistant', content: '어떤 일들이 잘 안 되셨나요?' },
      { sessionId: sessionIds[3], role: 'user', content: '최근에 여러 일들이 실패했어요.' },
      { sessionId: sessionIds[3], role: 'assistant', content: '실패한 경험이 자신감을 떨어뜨리셨군요. 하지만 실패는 성장의 과정이에요. 어떤 일들이 있었는지 더 자세히 이야기해주실 수 있나요?' },
    ];

      for (const msg of chatMessages) {
        const existing = await Chat.findOne({
          userId,
          sessionId: msg.sessionId,
          role: msg.role,
          content: msg.content,
        });

        if (!existing) {
          const chat = new Chat({
            userId,
            sessionId: msg.sessionId,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(),
          });
          await chat.save();
          console.log(`   ✓ ${msg.sessionId} - ${msg.role}: ${msg.content.substring(0, 30)}...`);
        }
      }

      console.log(`\n✅ 사용자 ${user.nickname}의 목업 데이터 생성 완료!`);
      console.log(`   - 일기: ${diaryEntries.length}개`);
      console.log(`   - 채팅 메시지: ${chatMessages.length}개`);
      console.log(`   - 채팅 세션: ${sessionIds.length}개`);
    }

    console.log('\n✅ 모든 목업 데이터 생성 완료!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// 명령줄 인자에서 사용자 ID 가져오기
const targetUserId = process.argv[2] || null;
generateMockData(targetUserId);

