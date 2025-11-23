import React from 'react';
import { Smile, Meh, Frown, Activity } from 'lucide-react-native';

export const MOODS = {
  happy: { icon: <Smile size={24} color="#CA8A04" />, color: '#FEF9C3', label: '행복' },
  neutral: { icon: <Meh size={24} color="#4B5563" />, color: '#F3F4F6', label: '평온' },
  sad: { icon: <Frown size={24} color="#2563EB" />, color: '#DBEAFE', label: '우울' },
  stressed: { icon: <Activity size={24} color="#DC2626" />, color: '#FEE2E2', label: '스트레스' },
};

// 하드코딩된 데이터 제거 - 모든 데이터는 백엔드에서 로드
// INITIAL_ENTRIES, WEEKLY_STATS, KEYWORDS는 더 이상 사용하지 않음