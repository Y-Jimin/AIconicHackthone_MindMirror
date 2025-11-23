import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MOODS } from '../constants/data';

const DiaryDetailScreen = ({ entry, onSave }) => {
  if (!entry) return null;
  const [content, setContent] = useState(entry.content);

  useEffect(() => {
    setContent(entry.content);
  }, [entry]);

  const formatDate = (dateString) => {
    const [y, m, d] = dateString.split('/');
    return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 24 }}>
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.dateText}>{formatDate(entry.date)}</Text>
          <Text style={styles.typeText}>{entry.type === 'chat' ? 'AI와의 대화' : '나의 일기'}</Text>
        </View>
        <View style={[styles.moodIconBox, { backgroundColor: MOODS[entry.mood]?.color }]}>
          {MOODS[entry.mood]?.icon}
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>오늘의 한 줄 요약</Text>
        <Text style={styles.summaryText}>{entry.summary}</Text>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.contentLabel}>내용 (터치하여 수정)</Text>
        <TextInput 
          style={styles.contentTextInput}
          multiline
          value={content}
          onChangeText={setContent}
          placeholder="내용을 입력하세요"
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity onPress={() => onSave(entry.id, content)} style={styles.saveBtn}>
        <Text style={styles.saveBtnText}>수정사항 저장</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffffff' },
  headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  dateText: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  typeText: { fontSize: 14, color: '#6B7280' },
  moodIconBox: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#FCE7F3' },
  summaryLabel: { fontSize: 12, color: '#F472B6', fontWeight: 'bold', marginBottom: 8 },
  summaryText: { fontSize: 16, fontWeight: '600', color: '#111827', lineHeight: 24 },
  contentSection: { backgroundColor: 'white', padding: 20, borderRadius: 16, minHeight: 200, borderWidth: 1, borderColor: '#FCE7F3', marginBottom: 24 },
  contentLabel: { fontSize: 14, color: '#9CA3AF', marginBottom: 12, fontWeight: '500' },
  contentTextInput: { fontSize: 16, color: '#374151', lineHeight: 24, minHeight: 150 },
  saveBtn: { backgroundColor: '#F472B6', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#F472B6', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 } },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default DiaryDetailScreen;
