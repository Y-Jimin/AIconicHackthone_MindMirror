import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MOODS } from '../constants/data';

const HomeScreen = ({ entries, userInfo, onDateSelect, onEntrySelect, onProfilePress }) => {
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

  const monthlyEntries = entries.filter(e => {
    const [eYear, eMonth] = e.date.split('/').map(Number);
    return eYear === year && eMonth === (month + 1);
  });

  monthlyEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.dateText}>
            {getTodayStr()} (오늘)
          </Text>
          <Text style={styles.greetingText}>
            안녕하세요,{"\n"}
            <Text style={{ color: '#F472B6' }}>{userInfo.name}</Text>님! 👋
          </Text>
        </View>
        
        <TouchableOpacity onPress={onProfilePress} style={styles.profileIconWrapper}>
          <Image 
            source={require('../../assets/profile.png')} 
            style={styles.profileImageSmall} 
          />
        </TouchableOpacity>
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

            let isBirthday = false;
            if (userInfo.birthday) {
              const [_, bMonth, bDay] = userInfo.birthday.split('/');
              if (parseInt(bMonth) === month + 1 && parseInt(bDay) === day) {
                isBirthday = true;
              }
            }

            let cellBackgroundColor = 'transparent';
            if (isSelected) {
                cellBackgroundColor = '#F472B6'; // 선택됨 (핑크)
            } else if (entry) {
                cellBackgroundColor = MOODS[entry.mood]?.color || '#F3F4F6';
            }

            return (
              <TouchableOpacity 
                key={day} 
                style={[
                  styles.dateCell,
                  { backgroundColor: cellBackgroundColor }
                ]}
                onPress={() => setSelectedDateStr(dateStr)}
              >
                <Text style={[
                  styles.dateNum, 
                  isSelected && styles.selectedNum,
                  isToday && !isSelected && styles.todayNum
                ]}>{day}</Text>
                
                {isBirthday && <Text style={styles.birthdayEmoji}>🎂</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
          {month + 1}월의 기록 ({monthlyEntries.length}개)
        </Text>
        
        {monthlyEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Image 
              source={require('../../assets/empty.png')} 
              style={styles.emptyIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyText}>작성된 기록이 없어요.</Text>
          </View>
        ) : (
          monthlyEntries.map(entry => (
            <TouchableOpacity 
              key={entry.id} 
              style={styles.recentItem}
              onPress={() => onEntrySelect(entry)}
            >
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeDay}>{entry.date.split('/')[2]}</Text>
                <Text style={styles.dateBadgeWeek}>일</Text> 
              </View>

              <View style={[styles.moodIconBox, { backgroundColor: MOODS[entry.mood]?.color || '#EEE' }]}>
                {MOODS[entry.mood]?.icon}
              </View>
              
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.recentTitle} numberOfLines={1}>{entry.summary}</Text>
                  <Text style={styles.typeLabel}>{entry.type === 'chat' ? 'AI 대화' : '일기'}</Text>
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
  screen: { flex: 1, backgroundColor: '#ffffffff' }, // 전체 배경 연한 핑크
  welcomeSection: { padding: 24, backgroundColor: 'white', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 32, flexDirection: 'row', justifyContent: 'space-between' },
  dateText: { color: '#6B7280', fontSize: 14, marginBottom: 4 },
  greetingText: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', lineHeight: 32 },
  
  profileIconWrapper: {},
  profileImageSmall: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#FCE7F3' },

  section: { padding: 20 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  arrowBtn: { padding: 8 },
  arrowIcon: { width: 24, height: 24, resizeMode: 'contain' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayLabel: { width: '14.28%', textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
  
  dateCell: { 
    width: '14.28%', 
    height: 50, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 4, 
    borderRadius: 12,
  },
  
  selectedCell: { backgroundColor: '#F472B6' },
  
  dateNum: { fontSize: 14, color: '#374151' },
  selectedNum: { color: 'white', fontWeight: 'bold' },
  todayNum: { color: '#F472B6', fontWeight: 'bold' },
  
  birthdayEmoji: { fontSize: 10, marginTop: 2 },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: 'white', borderRadius: 16, marginTop: 10, minHeight: 200 },
  emptyIcon: { width: 80, height: 80, marginBottom: 16 },
  emptyText: { color: '#9CA3AF', fontSize: 16, fontWeight: '500' },
  
  recentItem: { backgroundColor: 'white', padding: 16, borderRadius: 16, flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  
  dateBadge: { alignItems: 'center', marginRight: 12, minWidth: 24 },
  dateBadgeDay: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  dateBadgeWeek: { fontSize: 10, color: '#9CA3AF' },

  moodIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  recentTitle: { fontSize: 14, fontWeight: 'bold', color: '#1F2937', flex: 1 },
  typeLabel: { fontSize: 11, color: '#F472B6', marginLeft: 8 },
  recentDate: { fontSize: 12, color: '#9CA3AF' },
  previewText: { fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 16 },
});

export default HomeScreen;