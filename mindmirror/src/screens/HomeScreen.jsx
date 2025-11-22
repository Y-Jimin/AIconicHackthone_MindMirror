import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { User, Calendar } from 'lucide-react-native';
import { MOODS } from '../constants/data';

const HomeScreen = ({ entries, onDateSelect, onEntrySelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };
  
  const [selectedDateStr, setSelectedDateStr] = useState(getTodayStr());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  
  const firstDayOfMonth = new Date(year, month, 1).getDay(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const selectedEntries = entries.filter(e => e.date === selectedDateStr);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.dateText}>
            {selectedDateStr === getTodayStr() ? `${selectedDateStr} (오늘)` : selectedDateStr}
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

      <View style={styles.section}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
            <Image source={require('../../assets/left.png')} style={styles.arrowIcon} />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>{year}년 {month + 1}월</Text>
          <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
            <Image source={require('../../assets/right.png')} style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarGrid}>
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <Text key={i} style={styles.dayLabel}>{d}</Text>
          ))}
          
          {Array(firstDayOfMonth).fill(null).map((_, i) => (
            <View key={`empty-${i}`} style={styles.dateCell} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = `${year}/${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
            const entry = entries.find(e => e.date === dateStr);
            const isSelected = dateStr === selectedDateStr;
            const isToday = dateStr === getTodayStr();

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

      <View style={styles.section}>
        {/* [수정] marginBottom: 16 추가로 간격 벌림 */}
        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>{selectedDateStr}의 기록</Text>
        
        {selectedEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#E5E7EB" />
            <Text style={styles.emptyText}>작성된 기록이 없어요.</Text>
          </View>
        ) : (
          selectedEntries.map(entry => (
            // [수정] onPress 이벤트 추가 (상세 보기 연결)
            <TouchableOpacity 
              key={entry.id} 
              style={styles.recentItem}
              onPress={() => onEntrySelect(entry)}
            >
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
            </TouchableOpacity>
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
  arrowIcon: { width: 24, height: 24, resizeMode: 'contain' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayLabel: { width: '14.28%', textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
  dateCell: { width: '14.28%', height: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 4, borderWidth: 1, borderColor: 'transparent', borderRadius: 12 },
  selectedCell: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  todayCellBorder: { borderColor: '#4F46E5' },
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
