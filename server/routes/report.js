const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');

/**
 * GET /api/report/:userId/weekly
 * 주간 리포트 데이터 (감정 그래프, 키워드 클라우드)
 */
router.get('/:userId/weekly', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { userId } = req.params;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '시작일과 종료일이 필요합니다. (startDate, endDate)',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const diaries = await Diary.find({
      userId,
      date: {
        $gte: start,
        $lte: end,
      },
    }).sort({ date: 1 });

    // 감정 점수 추이 (날짜별)
    const emotionTrend = diaries.map((diary) => ({
      date: diary.date.toISOString().split('T')[0],
      score: diary.emotionScore || 50,
      emotion: diary.emotion || 'Neutral',
      emotionEmoji: diary.emotionEmoji || '😐',
    }));

    // 키워드 추출 및 카운팅
    const keywordCount = {};
    diaries.forEach((diary) => {
      if (diary.stressKeywords && Array.isArray(diary.stressKeywords)) {
        diary.stressKeywords.forEach((keyword) => {
          keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
        });
      }
    });

    // Top 5 키워드
    const topKeywords = Object.entries(keywordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }));

    // 감정 분포
    const emotionDistribution = {};
    diaries.forEach((diary) => {
      const emotion = diary.emotion || 'Neutral';
      emotionDistribution[emotion] = (emotionDistribution[emotion] || 0) + 1;
    });

    // 평균 감정 점수
    const avgScore =
      diaries.length > 0
        ? diaries.reduce((sum, d) => sum + (d.emotionScore || 50), 0) / diaries.length
        : 50;

    res.json({
      success: true,
      data: {
        period: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
        },
        emotionTrend,
        topKeywords,
        emotionDistribution,
        averageScore: Math.round(avgScore),
        totalRecords: diaries.length,
      },
    });
  } catch (error) {
    console.error('Weekly Report Error:', error);
    res.status(500).json({
      success: false,
      message: '주간 리포트 생성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/report/:userId/monthly
 * 월간 전문 보고서 데이터 (상담사용)
 */
router.get('/:userId/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    const { userId } = req.params;

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: '연도와 월이 필요합니다. (year, month)',
      });
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const diaries = await Diary.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    // 감정 점수 추이
    const emotionTrend = diaries.map((diary) => ({
      date: diary.date.toISOString().split('T')[0],
      score: diary.emotionScore || 50,
      emotion: diary.emotion || 'Neutral',
    }));

    // 전체 키워드 통계
    const keywordCount = {};
    diaries.forEach((diary) => {
      if (diary.stressKeywords && Array.isArray(diary.stressKeywords)) {
        diary.stressKeywords.forEach((keyword) => {
          keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
        });
      }
    });

    // 긍정/부정 비율 계산
    const positiveCount = diaries.filter(
      (d) => d.emotion === 'Happy' || (d.emotionScore && d.emotionScore > 60)
    ).length;
    const negativeCount = diaries.filter(
      (d) => d.emotion === 'Sad' || d.emotion === 'Angry' || d.emotion === 'Anxious' || (d.emotionScore && d.emotionScore < 40)
    ).length;
    const neutralCount = diaries.length - positiveCount - negativeCount;

    // 핵심 사건 타임라인 (요약이 있는 일기들)
    const timeline = diaries
      .filter((d) => d.summary)
      .map((d) => ({
        date: d.date.toISOString().split('T')[0],
        summary: d.summary,
        emotion: d.emotion,
        emotionEmoji: d.emotionEmoji,
        recordType: d.recordType,
      }));

    // 상세 데이터
    const detailedData = diaries.map((d) => ({
      date: d.date.toISOString().split('T')[0],
      recordType: d.recordType,
      emotion: d.emotion,
      emotionScore: d.emotionScore,
      stressKeywords: d.stressKeywords,
      summary: d.summary,
      contentPreview: d.content.substring(0, 100) + (d.content.length > 100 ? '...' : ''),
    }));

    res.json({
      success: true,
      data: {
        period: {
          year: parseInt(year),
          month: parseInt(month),
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
        statistics: {
          totalRecords: diaries.length,
          averageScore: diaries.length > 0
            ? Math.round(diaries.reduce((sum, d) => sum + (d.emotionScore || 50), 0) / diaries.length)
            : 50,
          emotionDistribution: {
            positive: positiveCount,
            negative: negativeCount,
            neutral: neutralCount,
          },
          topKeywords: Object.entries(keywordCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([keyword, count]) => ({ keyword, count })),
        },
        emotionTrend,
        timeline,
        detailedData,
      },
    });
  } catch (error) {
    console.error('Monthly Report Error:', error);
    res.status(500).json({
      success: false,
      message: '월간 리포트 생성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;




