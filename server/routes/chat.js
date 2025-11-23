const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * GET /api/chat
 * Chat API 엔드포인트 정보
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chat API',
    endpoints: {
      'POST /api/chat/message': '채팅 메시지 저장',
      'GET /api/chat/session/:sessionId': '세션별 채팅 히스토리 조회',
      'GET /api/chat/user/:userId': '사용자별 최근 채팅 세션 조회',
    },
  });
});

/**
 * POST /api/chat/message
 * 채팅 메시지 저장
 */
router.post(
  '/message',
  [
    body('userId').notEmpty().withMessage('사용자 ID가 필요합니다.'),
    body('sessionId').notEmpty().withMessage('세션 ID가 필요합니다.'),
    body('role').isIn(['user', 'assistant']).withMessage('role은 user 또는 assistant여야 합니다.'),
    body('content').notEmpty().withMessage('메시지 내용이 필요합니다.'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId, sessionId, role, content } = req.body;

      // userId를 ObjectId로 변환
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

      // 채팅 메시지 저장
      const chat = new Chat({
        userId: userIdObjectId,
        sessionId,
        role,
        content,
        timestamp: new Date(),
      });

      await chat.save();

      res.status(201).json({
        success: true,
        data: chat,
        message: '채팅 메시지가 저장되었습니다.',
      });
    } catch (error) {
      console.error('Chat Save Error:', error);
      res.status(500).json({
        success: false,
        message: '채팅 메시지 저장 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * GET /api/chat/session/:sessionId
 * 세션별 채팅 히스토리 조회
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chats = await Chat.find({ sessionId })
      .sort({ timestamp: 1 }) // 시간순 정렬
      .select('role content timestamp');

    res.json({
      success: true,
      data: chats,
      sessionId,
      count: chats.length,
    });
  } catch (error) {
    console.error('Chat History Error:', error);
    res.status(500).json({
      success: false,
      message: '채팅 히스토리 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/chat/user/:userId
 * 사용자별 최근 채팅 세션 조회
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // userId를 ObjectId로 변환
    const userIdObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // 최근 채팅 메시지들을 가져와서 세션별로 그룹화
    const chats = await Chat.find({ userId: userIdObjectId })
      .sort({ timestamp: -1 })
      .limit(100)
      .select('sessionId role content timestamp');

    // 세션별로 그룹화
    const sessions = {};
    chats.forEach((chat) => {
      if (!sessions[chat.sessionId]) {
        sessions[chat.sessionId] = {
          sessionId: chat.sessionId,
          messages: [],
          lastMessageTime: chat.timestamp,
        };
      }
      sessions[chat.sessionId].messages.push({
        role: chat.role,
        content: chat.content,
        timestamp: chat.timestamp,
      });
    });

    // 세션 목록을 배열로 변환하고 최신순 정렬
    const sessionList = Object.values(sessions).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json({
      success: true,
      data: sessionList,
      count: sessionList.length,
    });
  } catch (error) {
    console.error('User Chat Sessions Error:', error);
    res.status(500).json({
      success: false,
      message: '채팅 세션 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;

