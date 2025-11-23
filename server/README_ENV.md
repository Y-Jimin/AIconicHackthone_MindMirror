# 환경 변수 설정 가이드

## .env 파일 생성

`server` 디렉토리에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# MongoDB 연결 URI
MONGODB_URI=mongodb://localhost:27017/mindmirror

# Google Gemini API Key
# Gemini API 키를 https://makersuite.google.com/app/apikey 에서 발급받아 입력하세요
GEMINI_API_KEY=your_gemini_api_key_here

# 서버 포트
PORT=3000

# 환경 설정 (development, production)
NODE_ENV=development
```

## Google Gemini API 키 발급 방법

1. https://makersuite.google.com/app/apikey 접속
2. Google 계정으로 로그인
3. "Create API Key" 클릭
4. 생성된 API 키를 복사하여 `.env` 파일의 `GEMINI_API_KEY`에 입력

또는

1. https://aistudio.google.com/app/apikey 접속
2. Google 계정으로 로그인
3. "Create API Key" 클릭
4. 생성된 API 키를 복사하여 `.env` 파일의 `GEMINI_API_KEY`에 입력

## MongoDB 설정

로컬 MongoDB를 사용하는 경우:
- MongoDB가 설치되어 있어야 합니다
- 기본 포트(27017)에서 실행 중이어야 합니다

MongoDB Atlas(클라우드)를 사용하는 경우:
- MongoDB Atlas에서 클러스터 생성
- Connection String을 복사하여 `MONGODB_URI`에 입력

## 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요 (이미 .gitignore에 포함되어 있음)
- API 키는 외부에 노출되지 않도록 주의하세요

