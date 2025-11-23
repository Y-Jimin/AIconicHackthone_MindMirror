import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export const MOODS = {
  happy: {
    icon: <Ionicons name="happy" size={20} color="#F59E0B" />,
    color: '#FEF3C7',
    textColor: '#D97706',
    label: '행복',
  },
  neutral: {
    icon: <Ionicons name="remove-circle" size={20} color="#6B7280" />,
    color: '#F3F4F6',
    textColor: '#4B5563',
    label: '평온',
  },
  sad: {
    icon: <Ionicons name="sad" size={20} color="#3B82F6" />,
    color: '#DBEAFE',
    textColor: '#2563EB',
    label: '우울',
  },
  stressed: {
    icon: <Ionicons name="flash" size={20} color="#EF4444" />,
    color: '#FEE2E2',
    textColor: '#DC2626',
    label: '스트레스',
  },
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
  { word: '해커톤', count: 15, color: '#E0E7FF', textColor: '#4338CA' },
  { word: '팀플', count: 12, color: '#FEE2E2', textColor: '#DC2626' },
  { word: '커피', count: 8, color: '#FEF3C7', textColor: '#D97706' },
  { word: '수면', count: 5, color: '#DBEAFE', textColor: '#2563EB' },
];
