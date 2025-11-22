import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Sparkles, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { MOODS } from '../constants/data';

const HomeScreen = ({ entries, onDateSelect }) => {
  // 1. 현재 보고 있는 달력 날짜 (연/월 계산용)
  const [currentDate, setCurrentDate] = useState(new Date());
  // 2. 사용자가 선택한 날짜 (YYYY-MM-DD 문자열)
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 ~ 11
  
  // 달력 계산: 이번 달 1일의 요일, 마지막 날짜
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 월 이동 함수
  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  // 선택된 날짜의 기록 필터링
  const selectedEntries = entries.filter(e => e.date === selectedDateStr);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* 웰컴 섹션 */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.dateText}>
            {selectedDateStr === new Date().toISOString().split('T')[0] ? '오늘' : selectedDateStr}
          </Text>
          <Text style={styles.greetingText}>
            안녕하세요,{"\n"}
            <Text style={{ color: '#4F46E5' }}>민수</Text>님! 👋
          </Text>
        </View>
        <View style={styles.profileIcon}>
          <User size={24} color="#4F46E5" />
        </View>
      </View>

      {/* 달력 섹션 */}
      <View style={styles.section}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>{year}년 {month + 1}월</Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
            <ChevronRight size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarGrid}>
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <Text key={i} style={styles.dayLabel}>{d}</Text>
          ))}
          
          {/* 빈 날짜 채우기 */}
          {Array(firstDayOfMonth).fill(null).map((_, i) => (
            <View key={`empty-${i}`} style={styles.dateCell} />
          ))}

          {/* 날짜 렌더링 */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = entries.find(e => e.date === dateStr);
            const isSelected = dateStr === selectedDateStr;
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <TouchableOpacity 
                key={day} 
                style={[
                  styles.dateCell, 
                  isSelected && styles.selectedCell,
                  isToday && !isSelected && styles.todayCellBorder
                ]}
                onPress={() => setSelectedDateStr(dateStr)}
              >
                <Text style={[
                  styles.dateNum, 
                  isSelected && styles.selectedNum,
                  isToday && !isSelected && styles.todayNum
                ]}>{day}</Text>
                
                {/* 기록이 있으면 점 표시 */}
                {entry && (
                  <View style={[
                    styles.dot, 
                    { backgroundColor: MOODS[entry.mood]?.color === '#FEF9C3' ? '#FACC15' : '#60A5FA' }
                  ]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 선택된 날짜의 기록 목록 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{selectedDateStr}의 기록</Text>
        {selectedEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#E5E7EB" />
            <Text style={styles.emptyText}>작성된 기록이 없어요.</Text>
          </View>
        ) : (
          selectedEntries.map(entry => (
            <View key={entry.id} style={styles.recentItem}>
              <View style={[styles.moodIconBox, { backgroundColor: MOODS[entry.mood]?.color || '#EEE' }]}>
                {MOODS[entry.mood]?.icon}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.recentTitle}>{entry.summary}</Text>
                  <Text style={styles.recentDate}>{entry.type === 'chat' ? 'AI 대화' : '일기'}</Text>
                </View>
                {entry.content && (
                  <Text numberOfLines={2} style={styles.previewText}>{entry.content}</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  welcomeSection: { padding: 24, backgroundColor: 'white', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 32, flexDirection: 'row', justifyContent: 'space-between' },
  dateText: { color: '#6B7280', fontSize: 14, marginBottom: 4 },
  greetingText: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', lineHeight: 32 },
  profileIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  section: { padding: 20 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  arrowBtn: { padding: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayLabel: { width: '14.28%', textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
  dateCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  selectedCell: { backgroundColor: '#4F46E5', borderRadius: 12 },
  todayCellBorder: { borderWidth: 1, borderColor: '#4F46E5', borderRadius: 12 },
  dateNum: { fontSize: 14, color: '#374151' },
  selectedNum: { color: 'white', fontWeight: 'bold' },
  todayNum: { color: '#4F46E5', fontWeight: 'bold' },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: 'white', borderRadius: 16, marginTop: 10 },
  emptyText: { marginTop: 12, color: '#9CA3AF' },
  recentItem: { backgroundColor: 'white', padding: 16, borderRadius: 16, flexDirection: 'row', marginBottom: 12 },
  moodIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  recentTitle: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
  recentDate: { fontSize: 12, color: '#9CA3AF' },
  previewText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});

export default HomeScreen;