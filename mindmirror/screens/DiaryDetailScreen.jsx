import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { calendarAPI } from '../services/api';
import { MOODS } from '../constants/data';

const DiaryDetailScreen = ({ date, userId, onBack }) => {
  const [diaries, setDiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDiaries();
  }, [date, userId]);

  const loadDiaries = async () => {
    if (!userId || !date) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await calendarAPI.getDiariesByDate(userId, date);
      if (response.success && response.data) {
        setDiaries(response.data);
      }
    } catch (err) {
      console.error('Load Diaries Error:', err);
      setError('일기를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>일기를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDiaries}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{formatDate(date)}</Text>
        {diaries.length === 0 && (
          <Text style={styles.emptyText}>이 날짜에는 기록이 없습니다.</Text>
        )}
      </View>

      {diaries.map((diary, index) => (
        <View key={diary._id || index} style={styles.diaryCard}>
          <View style={styles.diaryHeader}>
            <View
              style={[
                styles.moodIconContainer,
                {
                  backgroundColor:
                    diary.emotion === 'Happy'
                      ? '#FEF3C7'
                      : diary.emotion === 'Sad'
                      ? '#DBEAFE'
                      : diary.emotion === 'Angry'
                      ? '#FEE2E2'
                      : diary.emotion === 'Anxious'
                      ? '#FEF3C7'
                      : '#F3F4F6',
                },
              ]}
            >
              <Text style={styles.emotionEmoji}>
                {diary.emotionEmoji || '😐'}
              </Text>
            </View>
            <View style={styles.diaryHeaderInfo}>
              <View style={styles.diaryTypeContainer}>
                <Text
                  style={[
                    styles.diaryType,
                    {
                      color:
                        diary.recordType === 'chatbot' ? '#4338CA' : '#059669',
                    },
                  ]}
                >
                  {diary.recordType === 'chatbot' ? 'AI 대화' : '일기'}
                </Text>
                {diary.emotion && (
                  <Text style={styles.emotionText}>
                    {diary.emotion === 'Happy'
                      ? '행복'
                      : diary.emotion === 'Sad'
                      ? '우울'
                      : diary.emotion === 'Angry'
                      ? '화남'
                      : diary.emotion === 'Anxious'
                      ? '불안'
                      : '평온'}
                  </Text>
                )}
              </View>
              {diary.summary && (
                <Text style={styles.summaryText}>{diary.summary}</Text>
              )}
            </View>
          </View>

          <View style={styles.contentContainer}>
            {diary.recordType === 'chatbot' && diary.chatHistory ? (
              <View style={styles.chatContainer}>
                {diary.chatHistory.map((msg, msgIndex) => (
                  <View
                    key={msgIndex}
                    style={[
                      styles.chatMessage,
                      msg.role === 'user' && styles.chatMessageUser,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chatMessageText,
                        msg.role === 'user' && styles.chatMessageTextUser,
                      ]}
                    >
                      {msg.content}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.contentText}>{diary.content}</Text>
            )}
          </View>

          {diary.stressKeywords && diary.stressKeywords.length > 0 && (
            <View style={styles.keywordsContainer}>
              <Text style={styles.keywordsLabel}>주요 키워드:</Text>
              <View style={styles.keywordsList}>
                {diary.stressKeywords.map((keyword, kwIndex) => (
                  <View key={kwIndex} style={styles.keywordTag}>
                    <Text style={styles.keywordText}>#{keyword}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  diaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  diaryHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  moodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionEmoji: {
    fontSize: 28,
  },
  diaryHeaderInfo: {
    flex: 1,
  },
  diaryTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  diaryType: {
    fontSize: 14,
    fontWeight: '600',
  },
  emotionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  contentContainer: {
    marginTop: 8,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
  },
  chatContainer: {
    gap: 12,
  },
  chatMessage: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  chatMessageUser: {
    backgroundColor: '#4F46E5',
    alignSelf: 'flex-end',
  },
  chatMessageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1F2937',
  },
  chatMessageTextUser: {
    color: '#FFFFFF',
  },
  keywordsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  keywordsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E0E7FF',
    borderRadius: 12,
  },
  keywordText: {
    fontSize: 12,
    color: '#4338CA',
    fontWeight: '500',
  },
});

export default DiaryDetailScreen;

