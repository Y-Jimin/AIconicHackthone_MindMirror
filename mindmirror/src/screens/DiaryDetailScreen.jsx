import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MOODS } from '../constants/data';

const DiaryDetailScreen = ({ entry }) => {
  if (!entry) return null;

  // 날짜 포맷 변환 (YYYY/MM/DD -> YYYY년 M월 D일)
  const formatDate = (dateString) => {
    const [y, m, d] = dateString.split('/');
    return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 24 }}>
      {/* 헤더: 날짜 및 감정 아이콘 */}
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.dateText}>{formatDate(entry.date)}</Text>
          <Text style={styles.typeText}>{entry.type === 'chat' ? 'AI와의 대화' : '나의 일기'}</Text>
        </View>
        <View style={[styles.moodIconBox, { backgroundColor: MOODS[entry.mood]?.color }]}>
          {MOODS[entry.mood]?.icon}
        </View>
      </View>

      {/* 요약 카드 */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>오늘의 한 줄 요약</Text>
        <Text style={styles.summaryText}>{entry.summary}</Text>
      </View>

      {/* 본문 내용 */}
      <View style={styles.contentSection}>
        <Text style={styles.contentLabel}>내용</Text>
        <Text style={styles.contentText}>{entry.content}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  headerSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  dateText: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  typeText: { fontSize: 14, color: '#6B7280' },
  moodIconBox: { 
    width: 56, 
    height: 56, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  summaryLabel: { fontSize: 12, color: '#4F46E5', fontWeight: 'bold', marginBottom: 8 },
  summaryText: { fontSize: 16, fontWeight: '600', color: '#111827', lineHeight: 24 },
  contentSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  contentLabel: { fontSize: 14, color: '#9CA3AF', marginBottom: 12, fontWeight: '500' },
  contentText: { fontSize: 16, color: '#374151', lineHeight: 26 },
});

export default DiaryDetailScreen;