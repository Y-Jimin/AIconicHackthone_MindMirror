import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TrendingUp, Lock } from 'lucide-react-native';
import { KEYWORDS, MOODS } from '../constants/data'; // MOODS 색상 활용

const ReportScreen = ({ entries }) => {
  // 1. 최근 7일 날짜 구하기 로직
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      
      // 요일 구하기
      const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
      const dayLabel = weekDays[d.getDay()];

      dates.push({
        fullDate: `${year}/${month}/${day}`, // 데이터 비교용
        displayDate: `${parseInt(month)}.${parseInt(day)}`, // 화면 표시용 (MM.DD)
        dayLabel: dayLabel // 요일
      });
    }
    return dates;
  };

  const recentDays = getLast7Days();
  const startDate = recentDays[0].displayDate;
  const endDate = recentDays[6].displayDate;

  // 2. 감정 점수 및 색상 변환 함수
  const getMoodInfo = (mood) => {
    switch (mood) {
      case 'happy': return { score: 90, color: '#FBBF24' }; // 높음, 노랑
      case 'neutral': return { score: 60, color: '#9CA3AF' }; // 중간, 회색
      case 'sad': return { score: 40, color: '#60A5FA' }; // 낮음, 파랑
      case 'stressed': return { score: 25, color: '#EF4444' }; // 매우 낮음, 빨강
      default: return { score: 0, color: 'transparent' };
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.welcomeSection}>
        <Text style={styles.pageTitle}>주간 마음 리포트</Text>
        <Text style={styles.pageSubtitle}>최근 7일 ({startDate} ~ {endDate})</Text>
      </View>

      {/* 차트 카드 */}
      <View style={styles.chartCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>감정 변동 추이</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>높을수록 긍정</Text></View>
        </View>
        
        <View style={styles.chartRow}>
          {recentDays.map((dayInfo, idx) => {
            // 해당 날짜의 일기 찾기 (여러 개면 첫 번째 것 기준)
            const entry = entries.find(e => e.date === dayInfo.fullDate);
            
            // 일기가 있으면 점수 계산, 없으면 0
            const { score, color } = entry ? getMoodInfo(entry.mood) : { score: 0, color: 'transparent' };

            return (
              <View key={idx} style={{ alignItems: 'center', flex: 1 }}>
                {/* 막대 영역 (높이 120px 고정) */}
                <View style={{ height: 120, justifyContent: 'flex-end', width: 12 }}>
                  {entry ? (
                    <View 
                      style={[
                        styles.bar, 
                        { 
                          height: `${score}%`, 
                          backgroundColor: color,
                          marginBottom: 0 
                        }
                      ]} 
                    />
                  ) : (
                    // 일기 없는 날은 빈 공간 (막대 없음)
                    <View style={{ height: 2, width: 4, backgroundColor: '#E5E7EB', marginBottom: 0, alignSelf: 'center' }} />
                  )}
                </View>
                
                {/* 날짜 레이블 */}
                <Text style={[styles.dayLabel, entry && { color: '#1F2937', fontWeight: 'bold' }]}>
                  {dayInfo.dayLabel}
                </Text>
                <Text style={styles.dateSubLabel}>{dayInfo.displayDate}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>주요 감정 키워드</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {KEYWORDS.map((k, i) => (
            <View key={i} style={[styles.keywordChip, { backgroundColor: k.bg }]}>
              <Text style={{ color: k.text, fontWeight: '600' }}>#{k.word} {k.count}회</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.premiumCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Lock size={16} color="#A5B4FC" />
          <Text style={{ color: '#A5B4FC', fontWeight: 'bold', marginLeft: 4 }}>PREMIUM</Text>
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
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  welcomeSection: { padding: 24, paddingBottom: 10 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  pageSubtitle: { fontSize: 16, color: '#6B7280' },
  
  chartCard: { margin: 20, padding: 20, backgroundColor: 'white', borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  badge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, color: '#6B7280' },
  
  chartRow: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', gap: 4 },
  bar: { width: '100%', borderRadius: 4 },
  
  dayLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  dateSubLabel: { fontSize: 10, color: '#D1D5DB' }, // 날짜(MM.DD)는 작게 표시

  section: { padding: 20 },
  keywordChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  premiumCard: { margin: 20, padding: 24, backgroundColor: '#1F2937', borderRadius: 20, overflow: 'hidden' },
});

export default ReportScreen;
