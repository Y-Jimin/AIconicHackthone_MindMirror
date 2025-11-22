import React from 'react';
import { Smile, Meh, Frown, Activity } from 'lucide-react-native';

export const MOODS = {
  happy: { icon: <Smile size={24} color="#CA8A04" />, color: '#FEF9C3', label: '행복' },
  neutral: { icon: <Meh size={24} color="#4B5563" />, color: '#F3F4F6', label: '평온' },
  sad: { icon: <Frown size={24} color="#2563EB" />, color: '#DBEAFE', label: '우울' },
  stressed: { icon: <Activity size={24} color="#DC2626" />, color: '#FEE2E2', label: '스트레스' },
};

export const INITIAL_ENTRIES = [
  { id: 1, date: '2023-10-01', type: 'diary', mood: 'happy', summary: '친구들과 맛집 탐방' },
  { id: 2, date: '2023-10-02', type: 'chat', mood: 'neutral', summary: '평범한 하루, 독서' },
  { id: 3, date: '2023-10-03', type: 'chat', mood: 'stressed', summary: '과제 마감 압박' },
  { id: 4, date: '2023-10-05', type: 'diary', mood: 'sad', summary: '비가 와서 기분이 처짐' },
  { id: 5, date: '2023-10-08', type: 'chat', mood: 'happy', summary: '해커톤 아이디어 구상' },
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
  { word: '해커톤', count: 15, bg: '#E0E7FF', text: '#4338CA' },
  { word: '팀플', count: 12, bg: '#FEE2E2', text: '#B91C1C' },
  { word: '커피', count: 8, bg: '#FEF3C7', text: '#B45309' },
  { word: '수면', count: 5, bg: '#DBEAFE', text: '#1D4ED8' },
];