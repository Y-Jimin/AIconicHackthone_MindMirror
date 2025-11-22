import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

import Header from './src/components/Header';
import TabBar from './src/components/TabBar';
import HomeScreen from './src/screens/HomeScreen';
import WriteSelectionScreen from './src/screens/WriteSelectionScreen';
import ChatScreen from './src/screens/ChatScreen';
import ReportScreen from './src/screens/ReportScreen';

import { INITIAL_ENTRIES } from './src/constants/data';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [viewMode, setViewMode] = useState('main'); 
  
  // [핵심] 모든 기록 데이터를 App에서 총괄 관리
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [tempDiaryText, setTempDiaryText] = useState('');

  // 일기 저장 기능
  const saveDiary = () => {
    if (!tempDiaryText.trim()) {
      Alert.alert("알림", "내용을 입력해주세요.");
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const newEntry = {
      id: Date.now(),
      date: todayStr,
      type: 'diary',
      mood: 'neutral', // (추후 감정선택 기능 추가 가능)
      summary: tempDiaryText.length > 15 ? tempDiaryText.substring(0, 15) + '...' : tempDiaryText,
      content: tempDiaryText
    };

    setEntries(prev => [...prev, newEntry]); // 데이터 추가
    setTempDiaryText(''); // 입력창 초기화
    
    // 저장 후 홈(달력)으로 이동
    setViewMode('main');
    setCurrentTab('home'); 
    Alert.alert("저장 완료", "오늘의 기록이 달력에 추가되었습니다!");
  };

  const getHeaderTitle = () => {
    if (viewMode === 'write-select') return '기록하기';
    if (viewMode === 'write-chat') return 'AI 마인드 봇';
    if (viewMode === 'write-diary') return '오늘의 일기';
    if (currentTab === 'home') return 'Mind Mirror';
    if (currentTab === 'report') return '분석 리포트';
    return '';
  };

  const renderContent = () => {
    if (viewMode === 'write-select') {
      return <WriteSelectionScreen onSelect={(type) => setViewMode(type === 'chat' ? 'write-chat' : 'write-diary')} />;
    }
    
    if (viewMode === 'write-chat') {
      return <ChatScreen onFinish={() => setViewMode('main')} />;
    }
    
    // 일기 작성 화면
    if (viewMode === 'write-diary') {
      return (
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{color: '#6B7280', marginBottom: 10}}>{new Date().toLocaleDateString()}의 기록</Text>
          <TextInput 
            multiline 
            style={styles.diaryInput} 
            placeholder="오늘 하루는 어땠나요? 자유롭게 적어주세요..." 
            value={tempDiaryText}
            onChangeText={setTempDiaryText}
          />
          <TouchableOpacity onPress={saveDiary} style={styles.saveBtn}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>기록 저장하기</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // HomeScreen에 entries 데이터 전달 (달력 표시용)
    if (currentTab === 'home') {
      return <HomeScreen entries={entries} onDateSelect={() => {}} />;
    }
    
    if (currentTab === 'report') {
      return <ReportScreen />;
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        title={getHeaderTitle()} 
        onBack={viewMode !== 'main' ? () => setViewMode('main') : null}
      />
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
      {viewMode === 'main' && <TabBar currentTab={currentTab} setCurrentTab={(tab) => {
        setCurrentTab(tab);
        if(tab === 'write') setViewMode('write-select');
        else setViewMode('main');
      }} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  diaryInput: { 
    flex: 1, 
    fontSize: 16, 
    lineHeight: 24, 
    textAlignVertical: 'top', 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 20 
  },
  saveBtn: { 
    backgroundColor: '#4F46E5', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#4F46E5', 
    shadowOpacity: 0.3, 
    shadowOffset: { width: 0, height: 4 }
  }
});
