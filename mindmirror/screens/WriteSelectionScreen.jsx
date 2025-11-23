import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WriteSelectionScreen = ({ onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        오늘 하루는{'\n'}어떠셨나요?
      </Text>
      <Text style={styles.subtitle}>
        편안한 방식을 선택해 기록해보세요.
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => onSelect('chat')}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="chatbubbles" size={24} color="#4F46E5" />
          </View>
          <Text style={styles.optionTitle}>AI 챗봇과 대화하기</Text>
          <Text style={styles.optionDescription}>
            친구와 수다 떨듯 편안하게{'\n'}이야기하며 하루를 정리해요.
          </Text>
          <View style={styles.optionBackgroundIcon}>
            <Ionicons name="chatbubbles" size={80} color="#4F46E5" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionCard, styles.optionCardSecondary]}
          onPress={() => onSelect('diary')}
        >
          <View style={[styles.optionIconContainer, styles.optionIconContainerSecondary]}>
            <Ionicons name="create" size={24} color="#374151" />
          </View>
          <Text style={styles.optionTitle}>직접 일기 쓰기</Text>
          <Text style={styles.optionDescription}>
            차분한 마음으로 나만의 속도로{'\n'}오늘의 감정을 기록해요.
          </Text>
          <View style={styles.optionBackgroundIcon}>
            <Ionicons name="create" size={80} color="#6B7280" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  optionCardSecondary: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIconContainerSecondary: {
    backgroundColor: '#FFFFFF',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  optionBackgroundIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 24,
    opacity: 0.1,
  },
});

export default WriteSelectionScreen;
