import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const WriteSelectionScreen = ({ onSelect }) => (
  <View style={[styles.screen, { padding: 20, paddingTop: 40 }]}>
    <Text style={styles.pageTitle}>오늘 하루는{"\n"}어떠셨나요?</Text>
    <Text style={styles.pageSubtitle}>편안한 방식을 선택해 기록해보세요.</Text>

    <TouchableOpacity onPress={() => onSelect('chat')} style={[styles.selectCard, { borderColor: '#FBCFE8', backgroundColor: '#FDF2F8' }]}>
      <View style={styles.iconCircle}>
        <Image source={require('../../assets/gemini.png')} style={styles.cardIcon} />
      </View>
      <Text style={styles.cardTitle}>AI 챗봇과 대화하기</Text>
      <Text style={styles.cardDesc}>친구와 수다 떨듯 편안하게{"\n"}이야기하며 하루를 정리해요.</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => onSelect('diary')} style={[styles.selectCard, { borderColor: '#F3F4F6', backgroundColor: '#F9FAFB', marginTop: 16 }]}>
      <View style={[styles.iconCircle, { backgroundColor: '#FFF' }]}>
        <Image source={require('../../assets/diary.png')} style={styles.cardIcon} />
      </View>
      <Text style={[styles.cardTitle, { color: '#1F2937' }]}>직접 일기 쓰기</Text>
      <Text style={styles.cardDesc}>차분한 마음으로 나만의 속도로{"\n"}오늘의 감정을 기록해요.</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffffff' },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  pageSubtitle: { fontSize: 16, color: '#6B7280', marginBottom: 40 },
  selectCard: { padding: 24, borderRadius: 24, borderWidth: 1 },
  iconCircle: { width: 56, height: 56, backgroundColor: 'white', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  cardIcon: { width: 32, height: 32, resizeMode: 'contain' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#F472B6', marginBottom: 4 },
  cardDesc: { color: '#6B7280', lineHeight: 20 },
});

export default WriteSelectionScreen;