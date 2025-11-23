// API Base URL - 개발 환경에서는 localhost 사용
// 프로덕션에서는 실제 서버 URL로 변경 필요
// Android 에뮬레이터: http://10.0.2.2:3000
// iOS 시뮬레이터: http://localhost:3000
// 실제 기기: http://[PC의 IP 주소]:3000
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000' 
  : 'https://your-production-server.com';

/**
 * API 호출 헬퍼 함수
 */
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🔵 API 호출:', url, options.method || 'GET');
    if (options.body) {
      console.log('🔵 요청 본문:', options.body);
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('🟢 응답 상태:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('🟢 API 응답 데이터:', endpoint, JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('🔴 API 오류:', data);
      throw new Error(data.message || `API 호출 실패 (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error('🔴 API Error:', endpoint, error.message);
    if (error.message.includes('fetch')) {
      console.error('🔴 네트워크 오류 - 서버가 실행 중인지 확인하세요:', API_BASE_URL);
    }
    throw error;
  }
};

/**
 * 사용자 API
 */
export const userAPI = {
  // 사용자 생성
  createUser: async (nickname) => {
    const response = await apiCall('/api/user', {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    });
    return response.data;
  },

  // 사용자 정보 조회
  getUser: async (userId) => {
    const response = await apiCall(`/api/user/${userId}`);
    return response.data;
  },

  // 닉네임으로 사용자 찾기
  getUserByNickname: async (nickname) => {
    const response = await apiCall(`/api/user/nickname/${nickname}`);
    return response.data;
  },

  // 일기가 있는 첫 번째 사용자 조회
  getUserWithDiaries: async () => {
    const response = await apiCall('/api/user/with-diaries/first');
    return response.data;
  },
};

/**
 * 일기 API
 */
export const diaryAPI = {
  // 텍스트 일기 저장
  saveTextDiary: async (userId, content, date) => {
    const response = await apiCall('/api/diary/text', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        content,
        date: date || new Date().toISOString(),
      }),
    });
    return response.data;
  },

  // 챗봇 대화 메시지 전송
  sendChatMessage: async (userId, message, sessionId) => {
    try {
      const response = await apiCall('/api/diary/chat', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          message,
          sessionId,
        }),
      });
      // 백엔드 응답 구조: { success: true, data: { response: "...", sessionId: "..." } }
      // apiCall이 전체 응답 객체를 반환하므로 response.data를 반환
      console.log('sendChatMessage 응답:', response);
      if (response && response.success && response.data) {
        return response.data; // { response: "...", sessionId: "..." }
      }
      return response;
    } catch (error) {
      console.error('sendChatMessage 에러:', error);
      throw error;
    }
  },

  // 챗봇 대화 종료 및 저장
  saveChatDiary: async (userId, sessionId, date) => {
    try {
      const response = await apiCall('/api/diary/chat/save', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          sessionId,
          date: date || new Date().toISOString(),
        }),
      });
      console.log('💾 [API] saveChatDiary 응답:', response);
      // 백엔드 응답 구조: { success: true, data: diary, message: '...' }
      // apiCall이 전체 응답을 반환하므로 response.data를 반환
      if (response && response.success && response.data) {
        return response; // 전체 응답 반환 { success, data, message }
      }
      return response;
    } catch (error) {
      console.error('💾 [API] saveChatDiary 에러:', error);
      throw error;
    }
  },
};

/**
 * 캘린더 API
 */
export const calendarAPI = {
  // 사용자의 모든 일기 조회
  getAllDiaries: async (userId) => {
    try {
      console.log('📚 [API] getAllDiaries 호출, userId:', userId);
      const response = await apiCall(`/api/calendar/${userId}/all`);
      console.log('📚 [API] getAllDiaries 응답 받음, 개수:', response?.data?.length || 0);
      
      // 11월 23일 일기가 있는지 확인
      if (response?.data && Array.isArray(response.data)) {
        const nov23Diaries = response.data.filter(diary => {
          const diaryDate = new Date(diary.date);
          return diaryDate.getFullYear() === 2024 && 
                 diaryDate.getMonth() === 10 && // 11월 (0-based)
                 diaryDate.getDate() === 23;
        });
        
        if (nov23Diaries.length > 0) {
          console.log(`⚠️ [API] 11월 23일 일기 발견: ${nov23Diaries.length}개`);
          nov23Diaries.forEach((diary, index) => {
            console.log(`  [${index + 1}] ID: ${diary._id}, 타입: ${diary.recordType}, 요약: ${diary.summary?.substring(0, 50)}...`);
          });
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ [API] getAllDiaries 에러:', error);
      throw error;
    }
  },

  // 월별 캘린더 데이터 조회
  getCalendarMonth: async (userId, year, month) => {
    const response = await apiCall(`/api/calendar/${userId}/${year}/${month}`);
    return response.data;
  },

  // 특정 날짜의 상세 일기 조회
  getDateDiaries: async (userId, date) => {
    // date 형식: YYYY-MM-DD
    const response = await apiCall(`/api/calendar/${userId}/date/${date}`);
    return response.data;
  },
};

/**
 * 리포트 API
 */
export const reportAPI = {
  // 주간 리포트
  getWeeklyReport: async (userId, startDate, endDate) => {
    // startDate, endDate 형식: YYYY-MM-DD
    const response = await apiCall(
      `/api/report/${userId}/weekly?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  // 월간 리포트
  getMonthlyReport: async (userId, year, month) => {
    const response = await apiCall(
      `/api/report/${userId}/monthly?year=${year}&month=${month}`
    );
    return response.data;
  },
};

/**
 * 날짜 형식 변환 헬퍼
 */
export const dateHelpers = {
  // Date 객체를 YYYY-MM-DD 형식으로 변환
  toYYYYMMDD: (date) => {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // YYYY/MM/DD 형식을 YYYY-MM-DD로 변환
  toYYYYMMDDFromSlash: (dateStr) => {
    if (!dateStr) return null;
    return dateStr.replace(/\//g, '-');
  },

  // YYYY-MM-DD 형식을 YYYY/MM/DD로 변환
  toYYYYMMDDWithSlash: (dateStr) => {
    if (!dateStr) return null;
    return dateStr.replace(/-/g, '/');
  },

  // 백엔드 Diary 모델을 프론트엔드 Entry 형식으로 변환
  diaryToEntry: (diary) => {
    let dateStr;
    
    // 날짜 변환 로직
    if (diary.date) {
      if (diary.date instanceof Date) {
        dateStr = dateHelpers.toYYYYMMDDWithSlash(dateHelpers.toYYYYMMDD(diary.date));
      } else if (typeof diary.date === 'string') {
        // ISO 형식인 경우 (예: "2025-01-15T00:00:00.000Z")
        if (diary.date.includes('T')) {
          const dateObj = new Date(diary.date);
          dateStr = dateHelpers.toYYYYMMDDWithSlash(dateHelpers.toYYYYMMDD(dateObj));
        } 
        // YYYY-MM-DD 형식인 경우
        else if (diary.date.match(/^\d{4}-\d{2}-\d{2}/)) {
          dateStr = dateHelpers.toYYYYMMDDWithSlash(diary.date);
        } 
        // 이미 YYYY/MM/DD 형식인 경우
        else if (diary.date.match(/^\d{4}\/\d{2}\/\d{2}/)) {
          dateStr = diary.date;
        }
        // 기타 형식
        else {
          const dateObj = new Date(diary.date);
          if (!isNaN(dateObj.getTime())) {
            dateStr = dateHelpers.toYYYYMMDDWithSlash(dateHelpers.toYYYYMMDD(dateObj));
          } else {
            dateStr = dateHelpers.toYYYYMMDDWithSlash(dateHelpers.toYYYYMMDD(new Date()));
          }
        }
      } else {
        dateStr = dateHelpers.toYYYYMMDDWithSlash(dateHelpers.toYYYYMMDD(new Date()));
      }
    } else {
      dateStr = dateHelpers.toYYYYMMDDWithSlash(dateHelpers.toYYYYMMDD(new Date()));
    }
    
    // emotion을 mood로 매핑
    const emotionToMood = {
      'Happy': 'happy',
      'Sad': 'sad',
      'Angry': 'stressed',
      'Anxious': 'stressed',
      'Stressed': 'stressed',
      'Neutral': 'neutral',
    };

    // summary 생성 (없으면 content에서 추출)
    let summary = diary.summary || '';
    if (!summary && diary.content) {
      summary = diary.content.length > 15 
        ? diary.content.substring(0, 15) + '...' 
        : diary.content;
    }

    const entry = {
      id: diary._id || diary.id || `diary_${Date.now()}`,
      date: dateStr,
      type: diary.recordType === 'chatbot' ? 'chat' : 'diary',
      recordType: diary.recordType || 'text', // 원본 recordType 보존
      mood: emotionToMood[diary.emotion] || 'neutral',
      summary: summary,
      content: diary.content || '',
      emotion: diary.emotion,
      emotionEmoji: diary.emotionEmoji,
      emotionScore: diary.emotionScore,
    };
    
    console.log('diaryToEntry 변환:', { 
      원본: { date: diary.date, _id: diary._id, recordType: diary.recordType, content: diary.content?.substring(0, 20) },
      변환: { ...entry, recordType: entry.recordType }
    });
    
    return entry;
  },
};

