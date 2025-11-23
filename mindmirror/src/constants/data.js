import React from 'react';
import { Smile, Meh, Frown, Activity } from 'lucide-react-native';

export const MOODS = {
  happy: { icon: <Smile size={24} color="#CA8A04" />, color: '#FEF9C3', label: '행복' },
  neutral: { icon: <Meh size={24} color="#4B5563" />, color: '#F3F4F6', label: '평온' },
  sad: { icon: <Frown size={24} color="#2563EB" />, color: '#DBEAFE', label: '우울' },
  stressed: { icon: <Activity size={24} color="#DC2626" />, color: '#FEE2E2', label: '스트레스' },
};

const today = new Date();
const todayStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

export const INITIAL_ENTRIES = [
  { 
    id: 1, 
    date: todayStr, 
    type: 'diary', 
    mood: 'happy', 
    summary: '해커톤 시작! 팀 빌딩 완료',
    content: '드디어 해커톤 날이다. 팀원들과 아이디어가 잘 맞아서 기분이 좋다.'
  },
  { 
    id: 2, 
    date: '2023/10/02', 
    type: 'chat', 
    mood: 'neutral', 
    summary: '주제 선정 고민 상담',
    content: 'AI 주제로 할지, 헬스케어로 할지 고민이다.'
  },
];

export const WEEKLY_STATS = [
  { day: '월', score: 60 },
  { day: '화', score: 45 },
  { day: '수', score: 30 },
  { day: '목', score: 70 },
  { day: '금', score: 85 },
  { day: '토', score: 90 },
  { day: '일', score: 80 },
];

export const KEYWORDS = [
  { word: '해커톤', count: 15, bg: '#FCE7F3', text: '#BE185D' }, // 핑크
  { word: '팀플', count: 12, bg: '#FEE2E2', text: '#B91C1C' },
  { word: '커피', count: 8, bg: '#FEF3C7', text: '#B45309' },
  { word: '수면', count: 5, bg: '#F3E8FF', text: '#7E22CE' }, // 보라
];