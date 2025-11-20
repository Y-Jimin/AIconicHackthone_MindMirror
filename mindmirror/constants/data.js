import React from 'react';
import { Smile, Meh, Frown, Activity } from 'lucide-react';

export const MOODS = {
  happy: { icon: <Smile className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-600', label: '행복' },
  neutral: { icon: <Meh className="w-5 h-5" />, color: 'bg-gray-100 text-gray-600', label: '평온' },
  sad: { icon: <Frown className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600', label: '우울' },
  stressed: { icon: <Activity className="w-5 h-5" />, color: 'bg-red-100 text-red-600', label: '스트레스' },
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
  { day: '수', score: 30 }, // High stress
  { day: '목', score: 70 },
  { day: '금', score: 85 },
  { day: '토', score: 90 },
  { day: '일', score: 80 },
];

export const KEYWORDS = [
  { word: '해커톤', count: 15, color: 'bg-indigo-100 text-indigo-700' },
  { word: '팀플', count: 12, color: 'bg-red-100 text-red-700' },
  { word: '커피', count: 8, color: 'bg-amber-100 text-amber-700' },
  { word: '수면', count: 5, color: 'bg-blue-100 text-blue-700' },
];
