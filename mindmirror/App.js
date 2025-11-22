import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, BackHandler } from 'react-native';

import Header from './src/components/Header';
import TabBar from './src/components/TabBar';
import HomeScreen from './src/screens/HomeScreen';
import WriteSelectionScreen from './src/screens/WriteSelectionScreen';
import ChatScreen from './src/screens/ChatScreen';
import ReportScreen from './src/screens/ReportScreen';
import DiaryDetailScreen from './src/screens/DiaryDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen'; // [신규] 프로필 스크린 import

import { INITIAL_ENTRIES } from './src/constants/data';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [viewMode, setViewMode] = useState('main'); // main, write-select, write-chat, write-diary, diary-detail, profile
  
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [tempDiaryText, setTempDiaryText] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);

  // [신규] 사용자 정보 상태 관리
  const [userInfo, setUserInfo] = useState({
    name: '민수',
    birthday: '', // YYYY/MM/DD
    photo: false  // 프로필 사진 유무
  });

  // 뒤로 가기 로직
  const goBack = () => {
    if (viewMode === 'diary-detail' || viewMode === 'profile') {
      setViewMode('main'); // 상세/프로필 -> 홈
    } else if (viewMode === 'write-chat' || viewMode === 'write-diary') {
      setViewMode('write-select');
    } else if (viewMode === 'write-select') {
      setViewMode('main'); 
      setCurrentTab('home');
    } else {
      return false;
    }
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (viewMode !== 'main') return goBack();
        return false; 
      }
    );
    return () => backHandler.remove();
  }, [viewMode]);

  const saveDiary = () => {
    if (!tempDiaryText.trim()) {
      Alert.alert("알림", "내용을 입력해주세요.");
      return;
    }
    const d = new Date();
    const todayStr = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

    const newEntry = {
      id: Date.now(),
      date: todayStr,
      type: 'diary',
      mood: 'neutral',
      summary: tempDiaryText.length > 15 ? tempDiaryText.substring(0, 15) + '...' : tempDiaryText,
      content: tempDiaryText
    };

    setEntries(prev => [...prev, newEntry]);
    setTempDiaryText('');
    setViewMode('main');
    setCurrentTab('home'); 
    Alert.alert("저장 완료", "오늘의 기록이 달력에 추가되었습니다!");
  };

  // [신규] 프로필 저장 함수
  const handleProfileSave = (newInfo) => {
    setUserInfo({ ...userInfo, ...newInfo });
    setViewMode('main'); // 저장 후 홈으로 이동
    Alert.alert("완료", "회원 정보가 수정되었습니다.");
  };

  const getHeaderTitle = () => {
    if (viewMode === 'write-select') return '기록하기';
    if (viewMode === 'write-chat') return 'AI 마인드 봇';
    if (viewMode === 'write-diary') return '오늘의 일기';
    if (viewMode === 'diary-detail') return '기록 상세';
    if (viewMode === 'profile') return '내 정보'; // [신규]
    if (currentTab === 'home') return 'Mind Mirror';
    if (currentTab === 'report') return '분석 리포트';
    return '';
  };

  const renderContent = () => {
    if (viewMode === 'write-select') return <WriteSelectionScreen onSelect={(type) => setViewMode(type === 'chat' ? 'write-chat' : 'write-diary')} />;
    if (viewMode === 'write-chat') return <ChatScreen onFinish={() => setViewMode('main')} />;
    
    if (viewMode === 'write-diary') {
      const d = new Date();
      const dateDisplay = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
      return (
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{color: '#6B7280', marginBottom: 10, fontSize: 16, fontWeight: '600'}}>
            {dateDisplay}의 기록
          </Text>
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

    if (viewMode === 'diary-detail') return <DiaryDetailScreen entry={selectedEntry} />;
    
    // [신규] 프로필 화면 연결
    if (viewMode === 'profile') {
      return (
        <ProfileScreen 
          userInfo={userInfo} 
          onSave={handleProfileSave}
          onBack={() => setViewMode('main')} // 저장 안하고 나가기
        />
      );
    }

    if (currentTab === 'report') return <ReportScreen />;
    
    // Home에 userInfo와 onProfilePress 전달
    return <HomeScreen 
      entries={entries} 
      userInfo={userInfo}
      onDateSelect={() => {}} 
      onEntrySelect={(entry) => {
        setSelectedEntry(entry);
        setViewMode('diary-detail');
      }}
      onProfilePress={() => setViewMode('profile')}
    />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* 프로필 화면일 때는 Header를 숨김 (ProfileScreen 내부에 커스텀 헤더가 있으므로) */}
      {viewMode !== 'profile' && (
        <Header 
          title={getHeaderTitle()} 
          onBack={viewMode !== 'main' ? goBack : null}
        />
      )}
      
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
      
      {viewMode === 'main' && (
        <TabBar currentTab={currentTab} setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if(tab === 'write') setViewMode('write-select');
          else setViewMode('main');
        }} />
      )}
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