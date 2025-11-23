# MindMirror Server

AI 기반 감정 일기 백엔드 서버

## 🚀 시작하기

### 1. 의존성 설치

```bash
cd server
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mindmirror
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. MongoDB 실행

MongoDB가 설치되어 있어야 합니다. 로컬에서 실행하거나 MongoDB Atlas를 사용할 수 있습니다.

### 4. 서버 실행

```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

서버는 `http://localhost:3000`에서 실행됩니다.

## 📡 API 엔드포인트

### 사용자 관리

- `POST /api/user` - 사용자 생성
- `GET /api/user/:userId` - 사용자 정보 조회

### 일기 기록

- `POST /api/diary/text` - 텍스트 일기 저장 및 분석
- `POST /api/diary/chat` - 챗봇 대화하기
- `POST /api/diary/chat/save` - 챗봇 대화 종료 및 저장

### 캘린더

- `GET /api/calendar/:userId/:year/:month` - 월별 캘린더 데이터 조회
- `GET /api/calendar/:userId/date/:date` - 특정 날짜 상세 조회

### 리포트

- `GET /api/report/:userId/weekly?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - 주간 리포트
- `GET /api/report/:userId/monthly?year=YYYY&month=MM` - 월간 전문 보고서

## 📝 API 사용 예시

### 1. 사용자 생성

```bash
POST /api/user
Content-Type: application/json

{
  "nickname": "홍길동"
}
```

### 2. 텍스트 일기 저장

```bash
POST /api/diary/text
Content-Type: application/json

{
  "userId": "user_id_here",
  "content": "오늘 팀플 때문에 스트레스를 많이 받았어요.",
  "date": "2025-01-15"
}
```

### 3. 챗봇 대화

```bash
POST /api/diary/chat
Content-Type: application/json

{
  "userId": "user_id_here",
  "message": "오늘 하루가 힘들었어요",
  "conversationHistory": []
}
```

### 4. 월별 캘린더 조회

```bash
GET /api/calendar/user_id_here/2025/1
```

### 5. 주간 리포트

```bash
GET /api/report/user_id_here/weekly?startDate=2025-01-01&endDate=2025-01-07
```

## 🏗️ 프로젝트 구조

```
server/
├── config/
│   └── database.js          # MongoDB 연결 설정
├── models/
│   ├── User.js              # 사용자 모델
│   └── Diary.js             # 일기 모델
├── routes/
│   ├── diary.js             # 일기 관련 라우트
│   ├── calendar.js          # 캘린더 관련 라우트
│   ├── report.js            # 리포트 관련 라우트
│   └── user.js              # 사용자 관련 라우트
├── services/
│   └── aiService.js         # OpenAI API 연동 서비스
├── server.js                # 메인 서버 파일
├── package.json
└── .env                     # 환경 변수 (직접 생성 필요)
```

## 🔑 주요 기능

1. **듀얼 기록 방식**: 텍스트 일기와 AI 챗봇 대화 두 가지 방식 지원
2. **자동 감정 분석**: OpenAI GPT를 활용한 감정 분류 및 키워드 추출
3. **캘린더 시각화**: 날짜별 감정 이모지 표시
4. **리포트 생성**: 주간/월간 감정 추이 및 통계 분석

## ⚠️ 주의사항

- OpenAI API 키가 필요합니다. [OpenAI Platform](https://platform.openai.com/)에서 발급받으세요.
- MongoDB가 실행 중이어야 합니다.
- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요.




