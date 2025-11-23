import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOODS } from '../constants/data';

const HomeScreen = ({ 
  entries, 
  onDateSelect, 
  onRefresh, 
  isLoading = false, 
  selectedYear, 
  selectedMonth, 
  onMonthChange 
}) => {
  
  // 1. 현재 표시할 년/월/일 계산
  const displayDate = useMemo(() => {
    const now = new Date();
    const year = selectedYear !== null && selectedYear !== undefined ? selectedYear : now.getFullYear();
    const month = selectedMonth !== null && selectedMonth !== undefined ? selectedMonth - 1 : now.getMonth(); // 0-11
    const day = now.getDate();
    
    return { year, month, day };
  }, [selectedYear, selectedMonth]);

  // 2. 달력 렌더링을 위한 기본 정보 계산
  const { currentDate, currentMonth, currentYear, monthDays, firstDayOfWeek, today } = useMemo(() => {
    const { year, month, day } = displayDate;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayWeekday = firstDay.getDay(); // 0(일요일) ~ 6(토요일)
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const now = new Date();
    const weekdayName = weekdays[now.getDay()];
    
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    
    return {
      currentDate: `${year}년 ${month + 1}월 ${isCurrentMonth ? day : 1}일 ${weekdayName}요일`,
      currentMonth: month + 1,
      currentYear: year,
      monthDays: daysInMonth,
      firstDayOfWeek: firstDayWeekday,
      today: isCurrentMonth ? day : null,
    };
  }, [displayDate]);

  const days = useMemo(() => {
    return Array.from({ length: monthDays }, (_, i) => i + 1);
  }, [monthDays]);

  // ✅ [수정 핵심] entries를 날짜(Key) 기반의 객체(Map)로 변환
  // 이 부분이 "날짜 밀림"과 "불 안 들어오는 문제"를 해결합니다.
  const entryMap = useMemo(() => {
    const map = {};
    
    if (!entries || entries.length === 0) return map;

    entries.forEach((entry) => {
      if (!entry.date) return;

      let dateKey = '';

      // 날짜 포맷 정규화 (YYYY-MM-DD)
      try {
        const d = new Date(entry.date);
        
        // 날짜가 유효하지 않으면 패스
        if (isNaN(d.getTime())) return;

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        dateKey = `${year}-${month}-${day}`;
      } catch (e) {
        console.error("Date parsing error:", e);
        return;
      }

      // hasRecord가 명시적으로 false인 경우만 제외
      if (entry.hasRecord !== false) {
        map[dateKey] = entry;
      }
    });

    return map;
  }, [entries]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {/* 헤더 섹션 */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.dateText}>{currentDate}</Text>
            <Text style={styles.greeting}>
              안녕하세요,{'\n'}
              <Text style={styles.name}>민수</Text>님! 👋
            </Text>
          </View>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#4F46E5" />
          </View>
        </View>

        {/* 기분 분석 카드 */}
        <View style={styles.moodCard}>
          <Ionicons
            name="sparkles"
            size={80}
            color="rgba(255,255,255,0.2)"
            style={styles.moodCardIcon}
          />
          <Text style={styles.moodCardLabel}>이번 달 기분 흐름</Text>
          <Text style={styles.moodCardTitle}>대체로 행복했어요 🥰</Text>
          <Text style={styles.moodCardSubtitle}>
            긍정적인 감정이 지난달보다 15% 늘었어요.
          </Text>
        </View>

        {/* 캘린더 섹션 */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <View style={styles.calendarTitleRow}>
              <TouchableOpacity
                onPress={() => {
                  if (onMonthChange) {
                    const newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
                    const newYear = currentMonth === 1 ? currentYear - 1 : currentYear;
                    onMonthChange(newYear, newMonth);
                  }
                }}
                style={styles.monthNavButton}
              >
                <Ionicons name="chevron-back" size={20} color="#4F46E5" />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>{currentYear}년 {currentMonth}월</Text>
              <TouchableOpacity
                onPress={() => {
                  if (onMonthChange) {
                    const newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
                    const newYear = currentMonth === 12 ? currentYear + 1 : currentYear;
                    onMonthChange(newYear, newMonth);
                  }
                }}
                style={styles.monthNavButton}
              >
                <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarGrid}>
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
              <View key={d} style={styles.dayLabel}>
                <Text style={styles.dayLabelText}>{d}</Text>
              </View>
            ))}
            
            {/* 빈 칸 채우기 */}
            {Array(firstDayOfWeek)
              .fill(null)
              .map((_, i) => (
                <View key={`empty-${i}`} style={styles.emptyDay} />
              ))}

            {/* 날짜 렌더링 */}
            {days.map((day) => {
              // 현재 그리는 날짜의 키 생성 (YYYY-MM-DD)
              const dateKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              // Map에서 데이터 O(1) 조회
              const entry = entryMap[dateKey];
              const isToday = today !== null && day === today;
              
              // 기분 데이터가 있는지 확인
              const hasMood = entry && entry.mood;

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    isToday && styles.dayButtonToday,
                  ]}
                  onPress={() => {
                    if (entry) {
                      onDateSelect(entry);
                    } else {
                      // 일기가 없어도 해당 날짜 상세 페이지로 이동
                      onDateSelect({ date: dateKey });
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isToday && styles.dayTextToday,
                      !entry && styles.dayTextEmpty, // 일기 없으면 흐리게
                    ]}
                  >
                    {day}
                  </Text>
                  
                  {/* 기분 색상 점 표시 */}
                  {hasMood && (
                    <View
                      style={[
                        styles.moodDot,
                        {
                          backgroundColor:
                            entry.mood === 'happy' ? '#FBBF24' :       // 노랑
                            entry.mood === 'stressed' ? '#EF4444' :    // 빨강
                            entry.mood === 'sad' ? '#3B82F6' :         // 파랑
                            entry.mood === 'anxious' ? '#F59E0B' :     // 주황
                            '#9CA3AF',                                 // 기본 회색
                        },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* 최근 기록 섹션 */}
      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>최근 기록</Text>
        {entries
          .slice()
          .reverse()
          .slice(0, 3)
          .map((entry) => {
            const mood = entry.mood && MOODS[entry.mood] ? entry.mood : 'neutral';
            const moodData = MOODS[mood] || MOODS['neutral']; // 안전장치 추가
            
            return (
              <View key={entry.id || Math.random()} style={styles.entryCard}>
                <View
                  style={[
                    styles.moodIconContainer,
                    { backgroundColor: moodData.color },
                  ]}
                >
                  {moodData.icon}
                </View>
                <View style={styles.entryContent}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entrySummary} numberOfLines={1}>
                        {entry.summary || "내용 없음"}
                    </Text>
                    <Text style={styles.entryDate}>
                        {entry.date ? new Date(entry.date).toLocaleDateString() : ''}
                    </Text>
                  </View>
                  <View style={styles.entryMeta}>
                    <View
                      style={[
                        styles.entryType,
                        {
                          backgroundColor:
                            entry.type === 'chat' ? '#E0E7FF' : '#D1FAE5',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.entryTypeText,
                          {
                            color: entry.type === 'chat' ? '#4338CA' : '#059669',
                          },
                        ]}
                      >
                        {entry.type === 'chat' ? 'AI 대화' : '일기'}
                      </Text>
                    </View>
                    <Text style={styles.entryMetaDivider}>|</Text>
                    <Text style={styles.entryMood}>
                      {moodData.label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingBottom: 100,
  },
  headerSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 6,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  name: {
    color: '#4F46E5',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  moodCardIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    transform: [{ rotate: '-12deg' }],
  },
  moodCardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#C7D2FE',
    marginBottom: 8,
  },
  moodCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  moodCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  calendarSection: {
    marginTop: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthNavButton: {
    padding: 4,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    minWidth: 100,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayLabel: {
    width: '13%',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  emptyDay: {
    width: '13%',
  },
  dayButton: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dayButtonToday: {
    backgroundColor: '#4F46E5',
  },
  dayText: {
    fontSize: 14,
    color: '#374151',
  },
  dayTextToday: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dayTextEmpty: {
    opacity: 0.5,
  },
  moodDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  recentSection: {
    padding: 24,
  },
  recentTitle: {
    fontSize: 18,

    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  moodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryContent: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  entrySummary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  entryDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  entryTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  entryMetaDivider: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  entryMood: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default HomeScreen;