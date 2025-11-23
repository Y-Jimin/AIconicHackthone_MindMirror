const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// API 키 확인
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다!');
  console.error('   .env 파일에 GEMINI_API_KEY를 설정해주세요.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 챗봇 대화용 - 공감형 페르소나로 응답
 * conversationHistory는 { role: 'user'|'assistant', content: string } 형식의 배열
 */
const getChatbotResponse = async (userMessage, conversationHistory = []) => {
  try {
    console.log('🤖 [Gemini] 모델 초기화 시작...');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: `당신은 따뜻하고 공감적인 감정 상담 챗봇입니다. 사용자의 감정을 듣고 공감하며, 구체적인 상황을 자연스럽게 물어보는 대화를 이어가세요.

주요 역할:
1. 사용자의 감정을 먼저 인정하고 공감하기
2. "그 일에 대해 좀 더 이야기해줄 수 있나요?"와 같이 구체적인 질문으로 대화를 이어가기
3. 판단하거나 조언하기보다는 듣고 이해하는 것에 집중
4. 대화를 자연스럽게 이어가되, 한 번에 하나의 질문만 하기

응답은 친근하고 따뜻한 톤으로 작성하세요.`,
    });
    console.log('✅ [Gemini] 모델 초기화 완료');

    // 대화 기록을 Gemini 형식으로 변환
    const chatHistory = [];
    
    console.log(`📚 [Gemini] 대화 히스토리 변환 시작 (${conversationHistory.length}개 메시지)`);
    // 기존 대화 기록 추가
    conversationHistory.forEach((msg, index) => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        chatHistory.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    });
    console.log(`✅ [Gemini] 변환된 히스토리: ${chatHistory.length}개`);

    // 대화 기록이 있으면 채팅 세션 시작, 없으면 단일 요청
    if (chatHistory.length > 0) {
      console.log('💬 [Gemini] 채팅 세션 시작 (히스토리 있음)');
      const chat = model.startChat({
        history: chatHistory,
      });
      console.log('📤 [Gemini] 메시지 전송:', userMessage.substring(0, 50) + '...');
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();
      console.log('✅ [Gemini] 응답 받음:', text.substring(0, 100) + '...');
      return text;
    } else {
      // 첫 메시지인 경우
      console.log('💬 [Gemini] 첫 메시지 (단일 요청)');
      console.log('📤 [Gemini] 메시지 전송:', userMessage.substring(0, 50) + '...');
      const result = await model.generateContent(userMessage);
      const response = await result.response;
      const text = response.text();
      console.log('✅ [Gemini] 응답 받음:', text.substring(0, 100) + '...');
      return text;
    }
  } catch (error) {
    console.error('❌ [Gemini] Chatbot API Error:', error);
    console.error('에러 상세:', error.message, error.stack);
    throw new Error('AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
};

/**
 * 텍스트 분석용 - 감정, 키워드, 점수 추출
 */
const analyzeEmotion = async (text) => {
  try {
    // 텍스트가 너무 길면 앞부분만 사용 (최대 2000자)
    const textToAnalyze = text.length > 2000 ? text.substring(0, 2000) + '...' : text;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const analysisPrompt = `다음 텍스트를 분석하여 JSON 형식으로 응답해주세요. 

텍스트: "${textToAnalyze}"

다음 형식으로 응답하세요 (JSON만 반환, 다른 설명 없이):
{
  "emotion": "감정명 (Happy, Sad, Angry, Anxious, Neutral 중 하나)",
  "emotionEmoji": "이모지 (예: 😊, 😢, 😠, 😰, 😐)",
  "emotionScore": 숫자 (0-100, 0이 매우 부정적, 100이 매우 긍정적),
  "stressKeywords": ["키워드1", "키워드2", ...] (스트레스 원인이 되는 핵심 단어 최대 5개),
  "summary": "한 줄 요약 (50자 이내)"
}

중요:
- emotion은 반드시 Happy, Sad, Angry, Anxious, Neutral 중 하나여야 합니다.
- stressKeywords는 구체적인 원인 단어만 추출하세요 (예: "팀플", "시험", "과제", "인간관계")
- JSON 형식만 반환하고 다른 텍스트는 포함하지 마세요.`;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const content = response.text().trim();

    // JSON 파싱 (코드 블록 제거)
    let jsonStr = content;
    if (content.startsWith('```json')) {
      jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (content.startsWith('```')) {
      jsonStr = content.replace(/```\n?/g, '');
    }

    // JSON 객체 추출 시도
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw content:', content);
      console.error('Parsed jsonStr:', jsonStr);
      // JSON 파싱 실패 시 기본값 반환
      throw new Error('JSON 파싱 실패: ' + parseError.message);
    }

    // 유효성 검증
    const validEmotions = ['Happy', 'Sad', 'Angry', 'Anxious', 'Neutral'];
    if (!validEmotions.includes(analysis.emotion)) {
      analysis.emotion = 'Neutral';
    }

    if (typeof analysis.emotionScore !== 'number') {
      analysis.emotionScore = 50;
    } else {
      analysis.emotionScore = Math.max(0, Math.min(100, analysis.emotionScore));
    }

    return analysis;
  } catch (error) {
    console.error('Emotion Analysis Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      text: text?.substring(0, 100), // 처음 100자만 로그
    });
    // 기본값 반환
    return {
      emotion: 'Neutral',
      emotionEmoji: '😐',
      emotionScore: 50,
      stressKeywords: [],
      summary: text ? `${text.substring(0, 30)}...` : '일기 내용',
    };
  }
};

/**
 * 챗봇 대화 요약 생성
 */
const summarizeConversation = async (chatHistory) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 대화가 너무 길면 최근 메시지만 사용 (최대 10개 메시지)
    const recentHistory = chatHistory.slice(-10);
    const conversationText = recentHistory
      .map((msg) => `${msg.role === 'user' ? '사용자' : '상담사'}: ${msg.content}`)
      .join('\n');

    const summaryPrompt = `다음 대화 내용을 간결하게 요약해주세요 (100자 이내):

${conversationText}

요약:`;

    const result = await model.generateContent(summaryPrompt);
    const response = await result.response;
    const summary = response.text().trim();

    return summary;
  } catch (error) {
    console.error('Summary Error:', error);
    return '대화 요약 생성 중 오류가 발생했습니다.';
  }
};

/**
 * 텍스트 분위기 분석
 * 내용의 전체적인 분위기를 분석하여 한 단어로 표현
 */
const analyzeAtmosphere = async (text) => {
  try {
    // 텍스트가 너무 길면 앞부분만 사용 (최대 1000자)
    const textToAnalyze = text.length > 1000 ? text.substring(0, 1000) + '...' : text;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const atmospherePrompt = `다음 텍스트의 전체적인 분위기를 분석하여 한 단어로 표현해주세요.

텍스트: "${textToAnalyze}"

다음 중 하나의 단어로만 응답하세요 (설명 없이 단어만):
- 따뜻한
- 차분한
- 긴장된
- 활기찬
- 우울한
- 밝은
- 어두운
- 평온한
- 흥미진진한
- 고요한
- 역동적인
- 편안한
- 불안한
- 희망적인
- 절망적인
- 열정적인
- 냉정한
- 친근한
- 거리감있는
- 따뜻한

가장 적합한 단어 하나만 반환하세요.`;

    const result = await model.generateContent(atmospherePrompt);
    const response = await result.response;
    const atmosphere = response.text().trim();

    // 불필요한 설명 제거 (단어만 추출)
    const validAtmospheres = [
      '따뜻한', '차분한', '긴장된', '활기찬', '우울한',
      '밝은', '어두운', '평온한', '흥미진진한', '고요한',
      '역동적인', '편안한', '불안한', '희망적인', '절망적인',
      '열정적인', '냉정한', '친근한', '거리감있는'
    ];

    // 응답에서 유효한 단어 찾기
    for (const valid of validAtmospheres) {
      if (atmosphere.includes(valid)) {
        return valid;
      }
    }

    // 기본값
    return '차분한';
  } catch (error) {
    console.error('Atmosphere Analysis Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      text: text?.substring(0, 100), // 처음 100자만 로그
    });
    return '차분한'; // 기본값
  }
};

module.exports = {
  getChatbotResponse,
  analyzeEmotion,
  summarizeConversation,
  analyzeAtmosphere,
};
