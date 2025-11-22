import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TrendingUp, Lock } from 'lucide-react-native';
import { WEEKLY_STATS, KEYWORDS } from '../constants/data';

const ReportScreen = () => (
  <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 100 }}>
    <View style={styles.welcomeSection}>
      <Text style={styles.pageTitle}>주간 마음 리포트</Text>
      <Text style={styles.pageSubtitle}>10월 3주차 (10.16 ~ 10.22)</Text>
    </View>

    <View style={styles.chartCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <Text style={styles.sectionTitle}>감정 변동 추이</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>높을수록 긍정</Text></View>
      </View>
      <View style={styles.chartRow}>
        {WEEKLY_STATS.map((stat, idx) => (
          <View key={idx} style={{ alignItems: 'center', flex: 1 }}>
            <View style={[styles.bar, { height: stat.score, backgroundColor: stat.score > 70 ? '#818CF8' : '#F87171' }]} />
            <Text style={styles.dayLabel}>{stat.day}</Text>
          </View>
        ))}
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },
  welcomeSection: { padding: 24, paddingBottom: 10 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  pageSubtitle: { fontSize: 16, color: '#6B7280' },
  chartCard: { margin: 20, padding: 20, backgroundColor: 'white', borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  badge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, color: '#6B7280' },
  chartRow: { flexDirection: 'row', height: 160, alignItems: 'flex-end', gap: 8 },
  bar: { width: '100%', borderRadius: 4, marginBottom: 8 },
  dayLabel: { fontSize: 12, color: '#9CA3AF' },
  section: { padding: 20 },
  keywordChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  premiumCard: { margin: 20, padding: 24, backgroundColor: '#1F2937', borderRadius: 20, overflow: 'hidden' },
});

export default ReportScreen;