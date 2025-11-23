const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  recordType: {
    type: String,
    enum: ['text', 'chatbot'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // AI 분석 결과 필드
  emotion: {
    type: String,
    default: null, // 'Happy', 'Sad', 'Angry', 'Anxious', 'Neutral' 등
  },
  emotionEmoji: {
    type: String,
    default: null, // 캘린더 표시용 이모지
  },
  emotionScore: {
    type: Number,
    default: 0, // 0-100 점수 (그래프용)
  },
  stressKeywords: {
    type: [String],
    default: [],
  },
  summary: {
    type: String,
    default: null, // 챗봇 대화 요약 또는 일기 요약
  },
  // 분위기 분석 결과 (Gemini API로 분석)
  atmosphere: {
    type: String,
    default: null, // 예: "따뜻한", "차분한", "긴장된", "활기찬", "우울한" 등
  },
  // 챗봇 대화의 경우 전체 대화 내용 저장
  chatHistory: {
    type: [
      {
        role: String, // 'user' or 'assistant'
        content: String,
        timestamp: Date,
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 날짜별 인덱스 추가 (조회 성능 향상)
diarySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Diary', diarySchema);



