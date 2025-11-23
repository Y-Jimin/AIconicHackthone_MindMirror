const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

/**
 * POST /api/user
 * 사용자 생성
 */
router.post(
  '/',
  [body('nickname').notEmpty().trim().withMessage('닉네임이 필요합니다.')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { nickname } = req.body;

      const user = new User({ nickname });
      await user.save();

      res.status(201).json({
        success: true,
        data: user,
        message: '사용자가 생성되었습니다.',
      });
    } catch (error) {
      console.error('User Creation Error:', error);
      res.status(500).json({
        success: false,
        message: '사용자 생성 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

/**
 * GET /api/user/nickname/:nickname
 * 닉네임으로 사용자 찾기
 */
router.get('/nickname/:nickname', async (req, res) => {
  try {
    const user = await User.findOne({ nickname: req.params.nickname });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('User Fetch Error:', error);
    res.status(500).json({
      success: false,
      message: '사용자 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/user/:userId
 * 사용자 정보 조회
 */
router.get('/:userId', async (req, res) => {
  try {
    // nickname으로 조회하는 경우 처리
    if (req.params.userId === 'nickname') {
      return res.status(400).json({
        success: false,
        message: '닉네임을 사용하려면 /api/user/nickname/:nickname을 사용하세요.',
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('User Fetch Error:', error);
    res.status(500).json({
      success: false,
      message: '사용자 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/user/with-diaries/first
 * 일기가 있는 첫 번째 사용자 조회 (일기가 가장 많은 사용자)
 */
router.get('/with-diaries/first', async (req, res) => {
  try {
    const Diary = require('../models/Diary');
    
    // 일기가 있는 사용자 ID들을 찾기
    const diariesWithUsers = await Diary.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      }
    ]);

    if (diariesWithUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: '일기가 있는 사용자가 없습니다.',
      });
    }

    const userId = diariesWithUsers[0]._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: user,
      diaryCount: diariesWithUsers[0].count,
    });
  } catch (error) {
    console.error('User with Diaries Fetch Error:', error);
    res.status(500).json({
      success: false,
      message: '일기가 있는 사용자 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;



