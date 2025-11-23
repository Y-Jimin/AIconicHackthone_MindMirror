import { Platform, Alert } from 'react-native';

// API 서버 기본 URL
// 개발 환경에서는 로컬 서버를 사용하고, 실제 기기에서는 IP 주소를 사용해야 합니다
// 예: 'http://localhost:3000' (에뮬레이터) 또는 'http://192.168.0.1:3000' (실제 기기)
const API_BASE_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:3000' // Android 에뮬레이터
    : 'http://localhost:3000' // iOS 시뮬레이터
  : 'http://localhost:3000'; // 실제 기기에서는 서버 IP 주소로 변경 필요

/**
 * API 요청 헬퍼 함수
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * 사용자 API
 */
export const userAPI = {
  // 사용자 생성
  createUser: async (nickname) => {
    return apiRequest('/api/user', {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    });
  },

  // 사용자 정보 조회
  getUser: async (userId) => {
    return apiRequest(`/api/user/${userId}`);
  },

  // 닉네임으로 사용자 찾기
  getUserByNickname: async (nickname) => {
    return apiRequest(`/api/user/nickname/${encodeURIComponent(nickname)}`);
  },
};

/**
 * 일기 API
 */
export const diaryAPI = {
  // 텍스트 일기 저장 및 분석
  saveTextDiary: async (userId, content, date) => {
    return apiRequest('/api/diary/text', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        content,
        date: date || new Date().toISOString(),
      }),
    });
  },

  // 챗봇 대화 메시지 전송 (sessionId 필요)
  sendChatMessage: async (userId, message, sessionId) => {
    return apiRequest('/api/diary/chat', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        message,
        sessionId,
      }),
    });
  },

  // 챗봇 대화 저장 (sessionId 사용)
  saveChatDiary: async (userId, sessionId, date) => {
    return apiRequest('/api/diary/chat/save', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        sessionId,
        date: date || new Date().toISOString(),
      }),
    });
  },
};

/**
 * 캘린더 API
 */
export const calendarAPI = {
  // 월별 캘린더 데이터 조회
  getCalendarByMonth: async (userId, year, month) => {
    return apiRequest(`/api/calendar/${userId}/${year}/${month}`);
  },

  // 특정 날짜의 일기 조회
  getDiariesByDate: async (userId, date) => {
    return apiRequest(`/api/calendar/${userId}/date/${date}`);
  },

  // 특정 기간의 일기 조회
  getDiariesByDateRange: async (userId, startDate, endDate) => {
    return apiRequest(
      `/api/calendar?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
    );
  },
};

/**
 * 리포트 API
 */
export const reportAPI = {
  // 리포트 조회
  getReport: async (userId, startDate, endDate) => {
    return apiRequest(
      `/api/report?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
    );
  },
};

export default {
  userAPI,
  diaryAPI,
  calendarAPI,
  reportAPI,
};

