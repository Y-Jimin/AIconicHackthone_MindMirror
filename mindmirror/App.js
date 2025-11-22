import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, BackHandler } from 'react-native';

import Header from './src/components/Header';
import TabBar from './src/components/TabBar';
import HomeScreen from './src/screens/HomeScreen';
import WriteSelectionScreen from './src/screens/WriteSelectionScreen';
import ChatScreen from './src/screens/ChatScreen';
import ReportScreen from './src/screens/ReportScreen';
import DiaryDetailScreen from './src/screens/DiaryDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen'; 

import { INITIAL_ENTRIES } from './src/constants/data';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [viewMode, setViewMode] = useState('main'); 
  
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [tempDiaryText, setTempDiaryText] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null); 

  const [userInfo, setUserInfo] = useState({
    name: '민수',
    birthday: '', 
    photo: false 
  });

  const goBack = () => {
    if (viewMode === 'diary-detail' || viewMode === 'profile') {
      setViewMode('main');
    } else if (viewMode === 'write-chat' || viewMode === 'write-diary') {
      setSelectedEntry(null);
      setTempDiaryText('');
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
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (viewMode !== 'main') return goBack();
      return false; 
    });
    return () => backHandler.remove();
  }, [viewMode]);

  const handleWriteDiary = () => {
    const d = new Date();
    const todayStr = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    
    const existingEntry = entries.find(e => e.date === todayStr && e.type === 'diary');

    if (existingEntry) {
      Alert.alert(
        "알림", 
        "오늘 이미 작성한 일기가 있어요. 내용을 수정할까요?",
        [
          { text: "취소", style: "cancel" },
          { text: "수정하기", onPress: () => editEntry(existingEntry) }
        ]
      );
    } else {
      setSelectedEntry(null);
      setTempDiaryText('');
      setViewMode('write-diary');
    }
  };

  const editEntry = (entry) => {
    setSelectedEntry(entry); 
    setTempDiaryText(entry.content); 
    setViewMode('write-diary');
  };

  const updateEntryDirectly = (id, newContent) => {
    setEntries(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          content: newContent,
          summary: newContent.length > 15 ? newContent.substring(0, 15) + '...' : newContent,
        };
      }
      return item;
    }));
    setSelectedEntry(prev => ({ ...prev, content: newContent }));
    Alert.alert("수정 완료", "내용이 저장되었습니다.");
  };

  const saveDiary = () => {
    if (!tempDiaryText.trim()) {
      Alert.alert("알림", "내용을 입력해주세요.");
      return;
    }

    if (selectedEntry) {
      setEntries(prev => prev.map(item => {
        if (item.id === selectedEntry.id) {
          return {
            ...item,
            content: tempDiaryText,
            summary: tempDiaryText.length > 15 ? tempDiaryText.substring(0, 15) + '...' : tempDiaryText,
          };
        }
        return item;
      }));
      Alert.alert("수정 완료", "일기가 수정되었습니다.");
    } else {
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
      Alert.alert("저장 완료", "오늘의 기록이 달력에 추가되었습니다!");
    }

    setTempDiaryText('');
    setSelectedEntry(null);
    setViewMode('main');
    setCurrentTab('home'); 
  };

  const handleProfileSave = (newInfo) => {
    setUserInfo({ ...userInfo, ...newInfo });
    setViewMode('main'); 
    Alert.alert("완료", "회원 정보가 수정되었습니다.");
  };

  const getHeaderTitle = () => {
    if (viewMode === 'write-select') return '기록하기';
    if (viewMode === 'write-chat') return 'AI 마인드 봇';
    if (viewMode === 'write-diary') return selectedEntry ? '일기 수정' : '오늘의 일기';
    if (viewMode === 'diary-detail') return '기록 상세';
    if (viewMode === 'profile') return '내 정보';
    if (currentTab === 'home') return 'Mind Mirror';
    if (currentTab === 'report') return '분석 리포트';
    return '';
  };

  const renderContent = () => {
    if (viewMode === 'write-select') {
      return <WriteSelectionScreen onSelect={(type) => {
        if (type === 'diary') handleWriteDiary();
        else setViewMode('write-chat');
      }} />;
    }
    
    if (viewMode === 'write-chat') return <ChatScreen onFinish={() => setViewMode('main')} />;
    
    if (viewMode === 'write-diary') {
      const targetDateStr = selectedEntry ? selectedEntry.date : `${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}`;
      const [y, m, d] = targetDateStr.split('/');
      const dateDisplay = `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;

      return (
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{color: '#6B7280', marginBottom: 10, fontSize: 16, fontWeight: '600'}}>
            {dateDisplay}의 기록 {selectedEntry ? '(수정 중)' : ''}
          </Text>
          <TextInput 
            multiline 
            style={styles.diaryInput} 
            placeholder="오늘 하루는 어땠나요? 자유롭게 적어주세요..." 
            value={tempDiaryText}
            onChangeText={setTempDiaryText}
          />
          <TouchableOpacity onPress={saveDiary} style={styles.saveBtn}>
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              {selectedEntry ? '수정 완료' : '기록 저장하기'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (viewMode === 'diary-detail') {
      return <DiaryDetailScreen entry={selectedEntry} onSave={updateEntryDirectly} />;
    }
    
    if (viewMode === 'profile') {
      return <ProfileScreen userInfo={userInfo} onSave={handleProfileSave} onBack={() => setViewMode('main')} />;
    }

    // [수정] ReportScreen에 entries 전달
    if (currentTab === 'report') {
      return <ReportScreen entries={entries} />;
    }
    
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
      {viewMode !== 'profile' && (
        <Header title={getHeaderTitle()} onBack={viewMode !== 'main' ? goBack : null} />
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
    flex: 1, fontSize: 16, lineHeight: 24, textAlignVertical: 'top', 
    backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 20 
  },
  saveBtn: { 
    backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, 
    alignItems: 'center', shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }
  }
});