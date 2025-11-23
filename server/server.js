const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

// 라우트 임포트
const diaryRoutes = require('./routes/diary');
const calendarRoutes = require('./routes/calendar');
const reportRoutes = require('./routes/report');
const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors()); // CORS 설정 (프론트엔드에서 API 호출 허용)
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true }));

// 데이터베이스 연결
connectDB();

// 라우트 설정
app.use('/api/diary', diaryRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStates[dbStatus] || 'unknown',
      readyState: dbStatus,
      host: mongoose.connection.host || 'not connected',
      name: mongoose.connection.name || 'not connected',
      uri: process.env.MONGODB_URI ? 'configured' : 'not configured (using default)',
    },
  });
});

// DB 연결 상태 확인 엔드포인트
app.get('/api/db/status', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    success: dbStatus === 1,
    database: {
      status: dbStates[dbStatus] || 'unknown',
      readyState: dbStatus,
      host: mongoose.connection.host || 'not connected',
      name: mongoose.connection.name || 'not connected',
      port: mongoose.connection.port || 'not connected',
      uri: process.env.MONGODB_URI 
        ? process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') // 비밀번호 숨김
        : 'mongodb://localhost:27017/mindmirror (default)',
    },
    collections: mongoose.connection.db 
      ? Object.keys(mongoose.connection.db.collections || {})
      : [],
  });
});

// 루트 엔드포인트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MindMirror API Server',
    version: '1.0.0',
    endpoints: {
      diary: '/api/diary',
      calendar: '/api/calendar',
      report: '/api/report',
      user: '/api/user',
      chat: '/api/chat',
    },
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 엔드포인트를 찾을 수 없습니다.',
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 MindMirror Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
});

