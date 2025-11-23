const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');

/**
 * GET /api/calendar
 * 캘린더 API 엔드포인트 정보
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Calendar API',
    endpoints: {
      'GET /api/calendar/:userId/:year/:month': '월별 캘린더 데이터 조회',
      'GET /api/calendar/:userId/date/:date': '특정 날짜의 상세 일기 조회',
    },
  });
});

/**
 * GET /api/calendar/:userId/all
 * 사용자의 모든 일기 조회 (전체 일기 데이터)
 */
router.get('/:userId/all', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📚 [getAllDiaries] 요청 받음, userId:', userId);

    // userId를 ObjectId로 변환
    const mongoose = require('mongoose');
    const userIdObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    console.log('📚 [getAllDiaries] DB 조회 시작...');
    // 사용자의 모든 일기 조회 (content가 있는 일기만)
    // 주의: content가 비어있거나 없는 일기는 제외됨
    // recordType은 모두 포함 (text, chatbot 모두)
    const diaries = await Diary.find({
      userId: userIdObjectId,
      content: { $exists: true, $ne: '' },
    })
      .sort({ date: -1 }) // 최신순
      .select('date emotionEmoji emotion emotionScore summary content recordType createdAt');
    
    console.log(`📚 [getAllDiaries] DB에서 조회된 일기 개수: ${diaries.length}개`);
    
    // recordType별 통계
    const textDiaries = diaries.filter(d => d.recordType === 'text');
    const chatbotDiaries = diaries.filter(d => d.recordType === 'chatbot');
    console.log(`📚 [getAllDiaries] 텍스트 일기: ${textDiaries.length}개, 챗봇 일기: ${chatbotDiaries.length}개`);

    console.log(`📚 [getAllDiaries] 조회된 일기 개수: ${diaries.length}개`);
    
    // 11월 23일 일기가 있는지 확인
    const nov23Diaries = diaries.filter(diary => {
      const diaryDate = new Date(diary.date);
      return diaryDate.getFullYear() === 2024 && 
             diaryDate.getMonth() === 10 && // 11월 (0-based)
             diaryDate.getDate() === 23;
    });
    
    if (nov23Diaries.length > 0) {
      console.log(`⚠️ [getAllDiaries] 11월 23일 일기 발견: ${nov23Diaries.length}개`);
      nov23Diaries.forEach((diary, index) => {
        console.log(`  [${index + 1}] ID: ${diary._id}, 타입: ${diary.recordType}, 요약: ${diary.summary?.substring(0, 50)}...`);
      });
    }

    res.json({
      success: true,
      data: diaries,
      count: diaries.length,
    });
  } catch (error) {
    console.error('❌ [getAllDiaries] 오류:', error);
    res.status(500).json({
      success: false,
      message: '일기 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/calendar/:userId/date/:date
 * 특정 날짜의 상세 일기 조회
 * date 형식: YYYY-MM-DD 또는 ISO 8601 형식
 * 주의: 이 라우트는 /:userId/:year/:month 보다 먼저 정의되어야 함
 */
router.get('/:userId/date/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;

    // userId를 ObjectId로 변환
    const mongoose = require('mongoose');
    const userIdObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // 날짜 파싱 (다양한 형식 지원)
    let targetDate;
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // YYYY-MM-DD 형식
      const [year, month, day] = date.split('-').map(Number);
      targetDate = new Date(year, month - 1, day);
    } else {
      // ISO 형식 또는 기타 형식
      targetDate = new Date(date);
    }

    // 유효한 날짜인지 확인
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 날짜 형식입니다. YYYY-MM-DD 형식을 사용해주세요.',
      });
    }

    // 하루의 시작과 끝 시간 설정
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 특정 날짜의 일기 조회 (텍스트 일기와 챗봇 일기 모두)
    const diaries = await Diary.find({
      userId: userIdObjectId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      // content가 있고 비어있지 않은 일기만 조회
      content: { $exists: true, $ne: '' },
    }).sort({ createdAt: -1 });
    
    console.log(`📅 [getDateDiaries] ${date} 일기 개수: ${diaries.length}개`);
    const textCount = diaries.filter(d => d.recordType === 'text').length;
    const chatbotCount = diaries.filter(d => d.recordType === 'chatbot').length;
    console.log(`📅 [getDateDiaries] 텍스트: ${textCount}개, 챗봇: ${chatbotCount}개`);

    res.json({
      success: true,
      data: diaries,
    });
  } catch (error) {
    console.error('Date Detail Error:', error);
    res.status(500).json({
      success: false,
      message: '일기 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/calendar/:userId/:year/:month
 * 월별 캘린더 데이터 조회 (날짜별 감정 이모지)
 * 주의: 이 라우트는 /:userId/date/:date 보다 나중에 정의되어야 함
 */
router.get('/:userId/:year/:month', async (req, res) => {
  try {
    const { userId, year, month } = req.params;

    // userId를 ObjectId로 변환
    const mongoose = require('mongoose');
    const userIdObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // year와 month 유효성 검증
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 연도입니다.',
      });
    }

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 월입니다. (1-12)',
      });
    }

    // 월의 시작일과 종료일 계산
    const startDate = new Date(yearNum, monthNum - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(yearNum, monthNum, 0); // 다음 달 0일 = 이번 달 마지막 날
    endDate.setHours(23, 59, 59, 999);

    // 날짜 유효성 검증
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 날짜입니다.',
      });
    }

    // 해당 월의 일기 조회 (content가 있는 일기만)
    const diaries = await Diary.find({
      userId: userIdObjectId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
      // content가 있고 비어있지 않은 일기만 조회
      content: { $exists: true, $ne: '' },
    }).select('date emotionEmoji emotion emotionScore summary content');

    // 날짜별로 그룹화 및 전반적인 감정 상태 계산
    // 실제로 일기가 있는 날짜만 처리
    const calendarData = {};
    diaries.forEach((diary) => {
      // content가 없거나 빈 문자열인 경우 제외
      if (!diary.content || (typeof diary.content === 'string' && diary.content.trim().length === 0)) {
        return;
      }
      
      // date가 유효한지 확인
      if (!diary.date) {
        return;
      }
      
      let dateKey;
      if (diary.date instanceof Date) {
        dateKey = diary.date.toISOString().split('T')[0];
      } else if (typeof diary.date === 'string') {
        // 문자열인 경우 YYYY-MM-DD 형식인지 확인
        if (diary.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateKey = diary.date;
        } else {
          // 다른 형식인 경우 Date로 변환
          const parsedDate = new Date(diary.date);
          if (!isNaN(parsedDate.getTime())) {
            dateKey = parsedDate.toISOString().split('T')[0];
          } else {
            return; // 유효하지 않은 날짜는 건너뜀
          }
        }
      } else {
        return; // date가 유효하지 않으면 건너뜀
      }
      
      if (dateKey) {
        
        if (!calendarData[dateKey]) {
          calendarData[dateKey] = {
            date: dateKey,
            diaries: [],
            emotionScores: [],
            emotions: [],
          };
        }
        
        calendarData[dateKey].diaries.push(diary);
        if (diary.emotionScore !== undefined && diary.emotionScore !== null) {
          calendarData[dateKey].emotionScores.push(diary.emotionScore);
        }
        if (diary.emotion) {
          calendarData[dateKey].emotions.push(diary.emotion);
        }
      }
    });
    
    // 실제로 일기가 있는 날짜만 반환 (diaries 배열이 비어있지 않은 경우만)
    const validCalendarData = {};
    Object.keys(calendarData).forEach((dateKey) => {
      if (calendarData[dateKey].diaries.length > 0) {
        validCalendarData[dateKey] = calendarData[dateKey];
      }
    });

    // 날짜별로 전반적인 감정 상태 계산
    // 실제로 일기가 있는 날짜만 처리
    const result = Object.values(validCalendarData).map((data) => {
      // 평균 감정 점수 계산
      const avgScore = data.emotionScores.length > 0
        ? data.emotionScores.reduce((sum, score) => sum + score, 0) / data.emotionScores.length
        : 50;

      // 가장 많이 나타난 감정 찾기
      let dominantEmotion = 'Neutral';
      if (data.emotions.length > 0) {
        const emotionCounts = {};
        data.emotions.forEach((emotion) => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
        dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
          emotionCounts[a] > emotionCounts[b] ? a : b,
          'Neutral'
        );
      }

      // 감정 점수에 따라 최종 감정 결정
      let finalEmotion = dominantEmotion;
      if (avgScore >= 70) {
        finalEmotion = 'Happy';
      } else if (avgScore <= 30) {
        finalEmotion = 'Sad';
      } else if (avgScore >= 40 && avgScore < 60) {
        if (dominantEmotion === 'Anxious' || dominantEmotion === 'Stressed') {
          finalEmotion = dominantEmotion;
        } else {
          finalEmotion = 'Neutral';
        }
      } else {
        // 30 < avgScore < 70인 경우
        if (dominantEmotion !== 'Neutral') {
          finalEmotion = dominantEmotion;
        }
      }

      // 감정에 따른 이모지
      const emotionEmojis = {
        'Happy': '😊',
        'Sad': '😢',
        'Angry': '😠',
        'Anxious': '😰',
        'Stressed': '😠',
        'Neutral': '😐',
      };

      // 가장 최근 일기의 요약 사용
      const latestDiary = data.diaries.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      return {
        date: data.date,
        emotionEmoji: emotionEmojis[finalEmotion] || '😐',
        emotion: finalEmotion,
        emotionScore: Math.round(avgScore),
        summary: latestDiary?.summary || '일기 기록',
        hasRecord: true,
      };
    });

    res.json({
      success: true,
      data: result,
      month: monthNum,
      year: yearNum,
    });
  } catch (error) {
    console.error('Calendar Error:', error);
    res.status(500).json({
      success: false,
      message: '캘린더 데이터 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;


