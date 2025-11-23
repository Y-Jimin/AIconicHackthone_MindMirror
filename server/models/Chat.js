const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
    index: true, // 세션별 조회 성능 향상
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // 분위기 분석 결과 (Gemini API로 분석)
  atmosphere: {
    type: String,
    default: null, // 예: "따뜻한", "차분한", "긴장된", "활기찬", "우울한" 등
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 세션별, 시간순 정렬을 위한 인덱스
chatSchema.index({ sessionId: 1, timestamp: 1 });
chatSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Chat', chatSchema);

