const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');
const Chat = require('../models/Chat');
const { analyzeEmotion, summarizeConversation, analyzeAtmosphere, getChatbotResponse } = require('../services/aiService');
const { body, validationResult } = require('express-validator');

/**
 * GET /api/diary
 * 일기 API 엔드포인트 정보 (수정완료)
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Diary API',
    endpoints: {
      'POST /api/diary/text': '텍스트 일기 저장 및 분석',
      'POST /api/diary/chat': '챗봇 대화 메시지 전송',
      'POST /api/diary/chat/save': '챗봇 대화 종료 및 저장',
    },
  });
});

/**
 * POST /api/diary/text
 * 텍스트 일기 저장 및 분석
 */
router.post(
  '/text',
  [
    body('userId').notEmpty().withMessage('사용자 ID가 필요합니다.'),
    body('content').notEmpty().withMessage('일기 내용이 필요합니다.'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, content, date } = req.body;

      // userId를 ObjectId로 변환
      const mongoose = require('mongoose');
      let userIdObjectId;
      try {
        userIdObjectId = mongoose.Types.ObjectId.isValid(userId)
          ? new mongoose.Types.ObjectId(userId)
          : userId;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 사용자 ID입니다.',
        });
      }

      // AI 분석 수행 (감정 분석 + 분위기 분석)
      // 각 분석이 실패해도 기본값으로 진행
      let analysis, atmosphere;
      try {
        [analysis, atmosphere] = await Promise.all([
          analyzeEmotion(content),
          analyzeAtmosphere(content),
        ]);
      } catch (error) {
        console.error('Analysis Error:', error);
        // 기본값으로 설정
        analysis = {
          emotion: 'Neutral',
          emotionEmoji: '😐',
          emotionScore: 50,
          stressKeywords: [],
          summary: '분석 중 오류가 발생했습니다.',
        };
        atmosphere = '차분한';
      }

      // 일기 저장
      const diary = new Diary({
        userId: userIdObjectId,
        date: date ? new Date(date) : new Date(),
        recordType: 'text',
        content,
        emotion: analysis.emotion,
        emotionEmoji: analysis.emotionEmoji,
        emotionScore: analysis.emotionScore,
        stressKeywords: analysis.stressKeywords,
        summary: analysis.summary,
        atmosphere: atmosphere,
      });

      await diary.save();

      res.status(201).json({
        success: true,
        data: diary,
        message: '일기가 저장되고 분석되었습니다.',
      });
    } catch (error) {
      console.error('Text Diary Error:', error);
      res.status(500).json({
        success: false,
        message: '일기 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * POST /api/diary/chat
 * 챗봇 대화하기 (단순 메시지 교환)
 * 메시지를 Chat 테이블에 저장하고 Gemini API로 응답 생성
 */
router.post('/chat', async (req, res) => {
  try {
    console.log('📥 [1단계] 챗봇 요청 받음:', { 
      userId: req.body.userId, 
      message: req.body.message?.substring(0, 50) + '...',
      sessionId: req.body.sessionId 
    });

    const { userId, message, sessionId } = req.body;

    // 입력 검증
    if (!userId || !message) {
      console.error('❌ [검증 실패] userId 또는 message가 없음');
      return res.status(400).json({
        success: false,
        message: '사용자 ID와 메시지가 필요합니다.',
      });
    }

    if (!sessionId) {
      console.error('❌ [검증 실패] sessionId가 없음');
      return res.status(400).json({
        success: false,
        message: '세션 ID가 필요합니다.',
      });
    }

    const mongoose = require('mongoose');

    // userId를 ObjectId로 변환
    let userIdObjectId;
    try {
      userIdObjectId = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;
    } catch (error) {
      console.error('❌ [검증 실패] 유효하지 않은 userId');
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID입니다.',
      });
    }

    console.log('✅ [2단계] 사용자 메시지 DB 저장 시작...');
    
    // 사용자 메시지의 분위기 분석 (에러가 나도 계속 진행)
    let userAtmosphere = '차분한';
    try {
      userAtmosphere = await analyzeAtmosphere(message);
      console.log('✅ 분위기 분석 완료:', userAtmosphere);
    } catch (atmosphereError) {
      console.warn('⚠️ 분위기 분석 실패 (기본값 사용):', atmosphereError.message);
    }

    // 사용자 메시지를 Chat 테이블에 저장
    const userChat = new Chat({
      userId: userIdObjectId,
      sessionId,
      role: 'user',
      content: message,
      atmosphere: userAtmosphere,
      timestamp: new Date(),
    });
    await userChat.save();
    console.log('✅ [2단계] 사용자 메시지 DB 저장 완료');

    console.log('📚 [3단계] 대화 히스토리 조회 시작...');
    // 세션의 이전 대화 히스토리를 DB에서 가져오기
    const chatHistory = await Chat.find({ sessionId })
      .sort({ timestamp: 1 })
      .select('role content')
      .limit(20); // 최근 20개 메시지만 사용

    console.log(`📚 대화 히스토리 개수: ${chatHistory.length}개`);

    // API 형식으로 변환 (현재 메시지 제외)
    const conversationHistory = chatHistory
      .slice(0, -1) // 마지막 메시지(현재 사용자 메시지) 제외
      .map((chat) => ({
        role: chat.role === 'user' ? 'user' : 'assistant',
        content: chat.content,
      }));

    console.log(`📚 Gemini에 전달할 히스토리 개수: ${conversationHistory.length}개`);

    // Gemini API로 응답 생성
    console.log('🤖 [4단계] Gemini API 호출 시작...');
    let aiResponse;
    try {
      aiResponse = await getChatbotResponse(message, conversationHistory);
      console.log('✅ [4단계] Gemini API 응답 받음');
      console.log('📝 응답 내용 (처음 100자):', aiResponse?.substring(0, 100) + '...');
      
      if (!aiResponse || aiResponse.trim() === '') {
        throw new Error('AI 응답이 비어있습니다.');
      }
    } catch (geminiError) {
      console.error('❌ [4단계] Gemini API 오류:', geminiError);
      console.error('에러 상세:', geminiError.message, geminiError.stack);
      // Gemini API 실패 시에도 사용자 메시지는 저장되었으므로, 기본 응답 반환
      aiResponse = '죄송합니다. 응답을 생성하는 중 문제가 발생했습니다. 다시 말씀해주시면 도와드리겠습니다.';
    }

    console.log('💾 [5단계] AI 응답 DB 저장 시작...');
    // AI 응답을 Chat 테이블에 저장
    try {
      const aiChat = new Chat({
        userId: userIdObjectId,
        sessionId,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      });
      await aiChat.save();
      console.log('✅ [5단계] AI 응답 DB 저장 완료');
    } catch (saveError) {
      console.error('⚠️ [5단계] AI 응답 DB 저장 실패 (응답은 반환):', saveError);
      // DB 저장 실패해도 응답은 반환
    }

    console.log('📤 [6단계] 프론트엔드로 응답 전송');
    const responseData = {
      success: true,
      data: {
        response: aiResponse,
        sessionId,
      },
    };
    console.log('📤 응답 데이터:', JSON.stringify(responseData, null, 2));
    
    res.json(responseData);
  } catch (error) {
    console.error('❌ [에러] Chat 전체 오류:', error);
    console.error('에러 스택:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || '챗봇 응답 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/diary/chat/save
 * 챗봇 대화 종료 및 저장
 * Chat 테이블에서 세션의 모든 메시지를 가져와서 Diary에 저장
 */
router.post(
  '/chat/save',
  [
    body('userId').notEmpty().withMessage('사용자 ID가 필요합니다.'),
    body('sessionId').notEmpty().withMessage('세션 ID가 필요합니다.'),
  ],
  async (req, res) => {
    try {
      console.log('💾 [저장] 챗봇 대화 저장 요청 받음');
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('❌ [저장] 검증 실패:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, sessionId, date } = req.body;
      console.log('💾 [저장] 요청 데이터:', { userId, sessionId, date });

      // userId를 ObjectId로 변환
      const mongoose = require('mongoose');
      let userIdObjectId;
      try {
        userIdObjectId = mongoose.Types.ObjectId.isValid(userId)
          ? new mongoose.Types.ObjectId(userId)
          : userId;
      } catch (error) {
        console.error('❌ [저장] 유효하지 않은 userId');
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 사용자 ID입니다.',
        });
      }

      console.log('📚 [저장 1단계] Chat 테이블에서 대화 히스토리 조회...');
      // Chat 테이블에서 세션의 모든 메시지 가져오기
      const chatHistory = await Chat.find({ 
        userId: userIdObjectId,
        sessionId 
      }).sort({ timestamp: 1 });

      console.log(`📚 [저장] 조회된 메시지 개수: ${chatHistory.length}개`);

      if (chatHistory.length === 0) {
        console.error('❌ [저장] 저장할 대화가 없음');
        return res.status(404).json({
          success: false,
          message: '저장할 대화가 없습니다.',
        });
      }

      console.log('📝 [저장 2단계] 대화 내용 합치기...');
      // 대화 내용을 하나의 텍스트로 합치기
      const conversationText = chatHistory
        .map((msg) => `${msg.role === 'user' ? '사용자' : '상담사'}: ${msg.content}`)
        .join('\n');
      console.log(`📝 [저장] 합친 대화 길이: ${conversationText.length}자`);

      console.log('🤖 [저장 3단계] AI 분석 시작 (감정, 분위기, 요약)...');
      // AI 분석 수행 (감정 분석 + 분위기 분석 + 요약)
      // 타임아웃 설정: 최대 10초
      let analysis, atmosphere, summary;
      
      // 타임아웃 헬퍼 함수
      const withTimeout = (promise, timeoutMs, defaultValue) => {
        return Promise.race([
          promise,
          new Promise((resolve) => {
            setTimeout(() => {
              console.warn(`⚠️ [저장] 타임아웃 발생 (${timeoutMs}ms)`);
              resolve(defaultValue);
            }, timeoutMs);
          })
        ]);
      };

      try {
        const startTime = Date.now();
        
        // 각 분석에 타임아웃 적용 (10초)
        [analysis, atmosphere, summary] = await Promise.all([
          withTimeout(
            analyzeEmotion(conversationText),
            10000, // 10초 타임아웃
            {
              emotion: 'Neutral',
              emotionEmoji: '😐',
              emotionScore: 50,
              stressKeywords: [],
              summary: conversationText.substring(0, 50) + '...',
            }
          ),
          withTimeout(
            analyzeAtmosphere(conversationText),
            8000, // 8초 타임아웃
            '차분한'
          ),
          withTimeout(
            summarizeConversation(
              chatHistory.map((msg) => ({
                role: msg.role,
                content: msg.content,
              }))
            ),
            10000, // 10초 타임아웃
            '대화가 저장되었습니다.'
          ),
        ]);
        
        const elapsedTime = Date.now() - startTime;
        console.log(`✅ [저장] AI 분석 완료 (${elapsedTime}ms):`, {
          emotion: analysis.emotion,
          emotionScore: analysis.emotionScore,
          atmosphere,
          summaryLength: summary?.length || 0
        });
      } catch (error) {
        console.error('❌ [저장] AI 분석 오류:', error);
        // 기본값으로 설정
        analysis = {
          emotion: 'Neutral',
          emotionEmoji: '😐',
          emotionScore: 50,
          stressKeywords: [],
          summary: conversationText.substring(0, 50) + '...',
        };
        atmosphere = '차분한';
        summary = '대화가 저장되었습니다.';
        console.log('⚠️ [저장] 기본값으로 진행');
      }

      console.log('💾 [저장 4단계] Diary 저장 시작...');
      // 일기 저장
      const diary = new Diary({
        userId: userIdObjectId,
        date: date ? new Date(date) : new Date(),
        recordType: 'chatbot',
        content: conversationText,
        emotion: analysis.emotion,
        emotionEmoji: analysis.emotionEmoji,
        emotionScore: analysis.emotionScore,
        stressKeywords: analysis.stressKeywords,
        summary: summary,
        atmosphere: atmosphere,
        chatHistory: chatHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date(),
        })),
      });

      await diary.save();
      console.log('✅ [저장 4단계] Diary 저장 완료:', diary._id);

      const responseData = {
        success: true,
        data: diary,
        message: '대화가 저장되고 분석되었습니다.',
      };
      console.log('📤 [저장] 응답 전송:', {
        diaryId: diary._id,
        emotion: diary.emotion,
        emotionScore: diary.emotionScore,
        summary: diary.summary?.substring(0, 50) + '...'
      });

      res.status(201).json(responseData);
    } catch (error) {
      console.error('❌ [저장] Chat Save Error:', error);
      console.error('에러 스택:', error.stack);
      res.status(500).json({
        success: false,
        message: '대화 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

module.exports = router;


