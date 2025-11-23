import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WEEKLY_STATS, KEYWORDS } from '../constants/data';

const ReportScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>주간 마음 리포트</Text>
        <Text style={styles.headerSubtitle}>10월 3주차 (10.16 ~ 10.22)</Text>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="trending-up" size={18} color="#4F46E5" />
              <Text style={styles.chartTitle}>감정 변동 추이</Text>
            </View>
            <View style={styles.chartBadge}>
              <Text style={styles.chartBadgeText}>높을수록 긍정</Text>
            </View>
          </View>
          <View style={styles.chartContainer}>
            {WEEKLY_STATS.map((stat, idx) => (
              <View key={idx} style={styles.chartBarContainer}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${stat.score}%`,
                      backgroundColor:
                        stat.score < 40
                          ? '#F87171'
                          : stat.score > 70
                          ? '#818CF8'
                          : '#D1D5DB',
                    },
                  ]}
                />
                <Text style={styles.chartDayLabel}>{stat.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>주요 감정 키워드</Text>
        <View style={styles.keywordsContainer}>
          {KEYWORDS.map((k, i) => (
            <View
              key={i}
              style={[styles.keywordTag, { backgroundColor: k.color }]}
            >
              <Text style={[styles.keywordText, { color: k.textColor }]}>
                #{k.word}{' '}
                <Text style={styles.keywordCount}>{k.count}회</Text>
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.analysisCard}>
        <Ionicons
          name="sparkles"
          size={20}
          color="#818CF8"
          style={styles.analysisIcon}
        />
        <Text style={styles.analysisTitle}>AI 분석 코멘트</Text>
        <Text style={styles.analysisText}>
          이번 주는 <Text style={styles.analysisBold}>'해커톤'</Text>과 관련된
          활동이 많아 성취감이 높았지만, 수요일에는 일시적으로 스트레스가
          높아졌네요. 충분한 휴식이 창의력에 도움이 됩니다. 주말에는{' '}
          <Text style={styles.analysisBold}>'커피'</Text> 대신 따뜻한 차를
          마시며 휴식을 취해보는 건 어떨까요?
        </Text>
      </View>

      <View style={styles.premiumCard}>
        <View style={styles.premiumGradient}>
          <View style={styles.premiumHeader}>
            <Ionicons name="lock-closed" size={16} color="#818CF8" />
            <Text style={styles.premiumLabel}>Premium</Text>
          </View>
          <Text style={styles.premiumTitle}>월간 심층 리포트</Text>
          <Text style={styles.premiumDescription}>
            정신과 상담에도 활용 가능한{'\n'}전문 데이터 분석을 받아보세요.
          </Text>
          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>
              상세 리포트 잠금 해제
            </Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  chartBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chartBadgeText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  chartContainer: {
    height: 160,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  chartBar: {
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
  },
  chartDayLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  keywordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  keywordCount: {
    opacity: 0.6,
    fontSize: 12,
  },
  analysisCard: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    position: 'relative',
  },
  analysisIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#312E81',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    color: '#4338CA',
    lineHeight: 20,
  },
  analysisBold: {
    fontWeight: 'bold',
  },
  premiumCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  premiumGradient: {
    backgroundColor: '#1F2937',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  premiumLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#818CF8',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
    lineHeight: 20,
  },
  premiumButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});

export default ReportScreen;
