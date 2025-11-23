import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Lock, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { reportAPI, dateHelpers } from '../services/api';

const ReportScreen = ({ userId }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = 현재 주, -1 = 이전 주, 1 = 다음 주

  // 주차별 7일 날짜 구하기
  const getWeekDays = (offset = 0) => {
    const dates = [];
    const today = new Date();
    
    // 현재 주의 월요일 찾기 (한국 기준: 월요일이 주의 시작)
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // 일요일이면 -6, 아니면 1-currentDay
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() + mondayOffset);
    
    // 주차 오프트 적용
    const targetMonday = new Date(thisMonday);
    targetMonday.setDate(thisMonday.getDate() + (offset * 7));
    
    // 해당 주의 7일 (월~일)
    for (let i = 0; i < 7; i++) {
      const d = new Date(targetMonday);
      d.setDate(targetMonday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push({
        fullDate: `${year}/${month}/${day}`,
        displayDate: `${parseInt(month)}.${parseInt(day)}`,
        dayLabel: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
        dateObj: d,
      });
    }
    return dates;
  };

  const currentWeekDays = getWeekDays(weekOffset);
  const startDate = currentWeekDays[0].displayDate;
  const endDate = currentWeekDays[6].displayDate;

  // 주간 리포트 데이터 로드
  useEffect(() => {
    if (userId) {
      loadWeeklyReport();
    }
  }, [userId, weekOffset]);

  const loadWeeklyReport = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const startDateForAPI = dateHelpers.toYYYYMMDDFromSlash(currentWeekDays[0].fullDate);
      const endDateForAPI = dateHelpers.toYYYYMMDDFromSlash(currentWeekDays[6].fullDate);
      
      console.log('주간 리포트 로드:', startDateForAPI, '~', endDateForAPI);
      const data = await reportAPI.getWeeklyReport(userId, startDateForAPI, endDateForAPI);
      console.log('받아온 리포트 데이터:', JSON.stringify(data, null, 2));
      setReportData(data);
    } catch (error) {
      console.error('주간 리포트 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 주차 이동
  const changeWeek = (direction) => {
    setWeekOffset(prev => prev + direction);
  };

  // 감정 점수를 백엔드 데이터에서 가져오기
  const getEmotionScore = (dateStr) => {
    if (!reportData || !reportData.emotionTrend) return null;
    
    const dateForAPI = dateHelpers.toYYYYMMDDFromSlash(dateStr);
    // 날짜 형식이 다를 수 있으므로 여러 형식으로 비교
    const trendItem = reportData.emotionTrend.find(item => {
      const itemDate = item.date;
      return itemDate === dateForAPI || 
             itemDate === dateStr || 
             itemDate === dateStr.replace(/\//g, '-') ||
             (itemDate && dateForAPI && itemDate.substring(0, 10) === dateForAPI.substring(0, 10));
    });
    
    if (trendItem) {
      const score = trendItem.score || 50;
      // 감정 점수에 따른 색상 (0-100점 기준)
      let color;
      if (score >= 70) {
        color = '#FBBF24'; // 행복 (노란색)
      } else if (score >= 50) {
        color = '#9CA3AF'; // 중립 (회색)
      } else if (score >= 30) {
        color = '#60A5FA'; // 우울 (파란색)
      } else {
        color = '#EF4444'; // 스트레스/화남 (빨간색)
      }
      
      return {
        score: score,
        color: color,
        emotion: trendItem.emotion || 'Neutral',
        emotionEmoji: trendItem.emotionEmoji || '😐',
      };
    }
    return null;
  };

  // 키워드 색상 생성 함수
  const getKeywordColor = (index) => {
    const colors = [
      { bg: '#E0E7FF', text: '#4338CA' },
      { bg: '#FEE2E2', text: '#B91C1C' },
      { bg: '#FEF3C7', text: '#B45309' },
      { bg: '#DBEAFE', text: '#1D4ED8' },
      { bg: '#D1FAE5', text: '#065F46' },
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#F472B6" />
        <Text style={{ marginTop: 16, color: '#6B7280' }}>리포트를 불러오는 중...</Text>
      </View>
    );
  }

  // 주차 표시 텍스트
  const getWeekLabel = () => {
    if (weekOffset === 0) {
      return '이번 주';
    } else if (weekOffset === -1) {
      return '지난 주';
    } else if (weekOffset < -1) {
      return `${Math.abs(weekOffset)}주 전`;
    } else {
      return `${weekOffset}주 후`;
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.welcomeSection}>
        <Text style={styles.pageTitle}>주간 마음 리포트</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <TouchableOpacity 
            onPress={() => changeWeek(-1)} 
            style={styles.weekNavButton}
          >
            <ChevronLeft size={20} color="#F472B6" />
          </TouchableOpacity>
          <Text style={styles.pageSubtitle}>
            {getWeekLabel()} ({startDate} ~ {endDate})
          </Text>
          <TouchableOpacity 
            onPress={() => changeWeek(1)} 
            style={styles.weekNavButton}
            disabled={weekOffset >= 0} // 미래 주는 이동 불가
          >
            <ChevronRight 
              size={20} 
              color={weekOffset >= 0 ? "#D1D5DB" : "#F472B6"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>감정 변동 추이</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>높을수록 긍정</Text></View>
        </View>
        <View style={styles.chartRow}>
          {currentWeekDays.map((dayInfo, idx) => {
            // 백엔드에서 가져온 감정 점수 사용
            const emotionData = getEmotionScore(dayInfo.fullDate);
            const hasData = emotionData !== null;
            const score = emotionData?.score || 0;
            const color = emotionData?.color || 'transparent';
            
            // 그래프 높이 계산 (0-100점을 픽셀 높이로 변환, 최소 4px)
            const maxHeight = 120; // 그래프 최대 높이
            const barHeight = hasData ? Math.max(4, (score / 100) * maxHeight) : 0;
            
            return (
              <View key={idx} style={{ alignItems: 'center', flex: 1 }}>
                <View style={{ height: maxHeight, justifyContent: 'flex-end', width: 12, marginBottom: 4 }}>
                  {hasData ? (
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: barHeight, 
                          backgroundColor: color,
                          marginBottom: 0,
                          minHeight: 4,
                        }
                      ]} 
                    />
                  ) : (
                    <View style={{ height: 2, width: 4, backgroundColor: '#E5E7EB', alignSelf: 'center' }} />
                  )}
                </View>
                
                {/* 날짜 레이블 */}
                <Text style={[styles.dayLabel, hasData && { color: '#1F2937', fontWeight: 'bold' }]}>
                  {dayInfo.dayLabel}
                </Text>
                <Text style={styles.dateSubLabel}>{dayInfo.displayDate}</Text>
                {hasData && (
                  <Text style={styles.scoreLabel}>{score}점</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>주요 감정 키워드</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {reportData && reportData.topKeywords && reportData.topKeywords.length > 0 ? (
            reportData.topKeywords.map((keyword, i) => {
              const color = getKeywordColor(i);
              return (
                <View key={i} style={[styles.keywordChip, { backgroundColor: color.bg }]}>
                  <Text style={{ color: color.text, fontWeight: '600' }}>#{keyword.keyword} {keyword.count}회</Text>
                </View>
              );
            })
          ) : (
            <Text style={{ color: '#9CA3AF', fontSize: 14 }}>키워드 데이터가 없습니다.</Text>
          )}
        </View>
      </View>

      <View style={styles.premiumCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Lock size={16} color="#F9A8D4" />
          <Text style={{ color: '#F9A8D4', fontWeight: 'bold', marginLeft: 4 }}>PREMIUM</Text>
        </View>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>월간 심층 리포트</Text>
        <Text style={{ color: '#D1D5DB', fontSize: 14, marginBottom: 16 }}>전문 상담 데이터 분석을 받아보세요.</Text>
        <TouchableOpacity style={{ backgroundColor: 'white', padding: 12, borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', color: '#111827' }}>상세 리포트 잠금 해제</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffffff' },
  welcomeSection: { padding: 24, paddingBottom: 10 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  pageSubtitle: { fontSize: 16, color: '#6B7280', marginHorizontal: 12 },
  weekNavButton: { 
    padding: 4,
    borderRadius: 8,
  },
  chartCard: { margin: 20, padding: 20, backgroundColor: 'white', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  badge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, color: '#6B7280' },
  chartRow: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', gap: 4 },
  bar: { width: '100%', borderRadius: 4 },
  dayLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  dateSubLabel: { fontSize: 10, color: '#D1D5DB', marginTop: 2 },
  scoreLabel: { fontSize: 9, color: '#6B7280', marginTop: 2, fontWeight: '600' },
  section: { padding: 20 },
  keywordChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  premiumCard: { margin: 20, padding: 24, backgroundColor: '#1F2937', borderRadius: 20, overflow: 'hidden' },
});

export default ReportScreen;