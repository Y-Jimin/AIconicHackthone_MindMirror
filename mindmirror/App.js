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
import DatePickerModal from './src/components/DatePickerModal'; 

import { INITIAL_ENTRIES } from './src/constants/data';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [viewMode, setViewMode] = useState('main'); 
  
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [tempDiaryText, setTempDiaryText] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null); 

  const [writingDate, setWritingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: '민수',
    birthday: '', 
    photo: false 
  });

  // [안전한 날짜 변환] YYYY/MM/DD 문자열을 Date 객체로 변환
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    // 1. 기본 변환 시도
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    
    // 2. 직접 파싱 (YYYY/MM/DD)
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date(); 
  };

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

  const getDateStr = (dateObj) => {
    // 안전 장치: dateObj가 Date 객체가 아니거나 Invalid Date면 오늘 날짜 반환
    const d = (dateObj instanceof Date && !isNaN(dateObj)) ? dateObj : new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleWriteDiary = () => {
    const today = new Date();
    const todayStr = getDateStr(today);
    checkEntryAndNavigate(todayStr, today);
  };

  // [수정] 경고창 없이 바로 이동
  const checkEntryAndNavigate = (dateStr, dateObj) => {
    const existingEntry = entries.find(e => e.date === dateStr && e.type === 'diary');

    setWritingDate(dateObj);

    if (existingEntry) {
      editEntry(existingEntry); 
    } else {
      setSelectedEntry(null);
      setTempDiaryText('');
      setViewMode('write-diary');
    }
  };

  const editEntry = (entry) => {
    setSelectedEntry(entry); 
    setTempDiaryText(entry.content); 
    // 문자열 날짜를 객체로 안전하게 변환하여 설정
    setWritingDate(parseDate(entry.date)); 
    setViewMode('write-diary');
  };

  // [수정] 날짜 변경 시 경고창 없이 바로 데이터 로드
  const handleDateChange = (newDateStr) => {
    const newDateObj = parseDate(newDateStr);
    const existingEntry = entries.find(e => e.date === newDateStr && e.type === 'diary');

    setWritingDate(newDateObj);

    if (existingEntry) {
      editEntry(existingEntry);
    } else {
      if (selectedEntry) {
        setSelectedEntry(null); 
        setTempDiaryText(''); // 새 날짜니까 내용 비우기
      }
    }
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

    const targetDateStr = getDateStr(writingDate);

    if (selectedEntry) {
      setEntries(prev => prev.map(item => {
        if (item.id === selectedEntry.id) {
          return {
            ...item,
            content: tempDiaryText,
            summary: tempDiaryText.length > 15 ? tempDiaryText.substring(0, 15) + '...' : tempDiaryText,
            date: targetDateStr 
          };
        }
        return item;
      }));
      Alert.alert("수정 완료", "일기가 수정되었습니다.");
    } else {
      const doubleCheck = entries.find(e => e.date === targetDateStr && e.type === 'diary');
      
      if (doubleCheck) {
        // 이미 존재하면 덮어쓰기 (Alert 없이 조용히 처리하거나 알림)
        setEntries(prev => prev.map(item => {
            if (item.id === doubleCheck.id) {
              return {
                ...item,
                content: tempDiaryText,
                summary: tempDiaryText.length > 15 ? tempDiaryText.substring(0, 15) + '...' : tempDiaryText,
              };
            }
            return item;
        }));
        Alert.alert("수정 완료", "기존 일기에 덮어썼습니다.");
      } else {
        const newEntry = {
          id: Date.now(),
          date: targetDateStr, 
          type: 'diary',
          mood: 'neutral', 
          summary: tempDiaryText.length > 15 ? tempDiaryText.substring(0, 15) + '...' : tempDiaryText,
          content: tempDiaryText
        };
        setEntries(prev => [...prev, newEntry]);
        Alert.alert("저장 완료", `${targetDateStr}에 일기가 저장되었습니다!`);
      }
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
    if (currentTab === 'home') return '감정일기';
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
      // [안전한 날짜 표시] writingDate 유효성 체크
      const isValidDate = !isNaN(writingDate.getTime());
      const safeDate = isValidDate ? writingDate : new Date();
      
      const y = safeDate.getFullYear();
      const m = safeDate.getMonth() + 1;
      const d = safeDate.getDate();
      const dateDisplay = `${y}년 ${m}월 ${d}일`;

      return (
        <View style={{ flex: 1, padding: 20 }}>
          <View style={styles.dateRow}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateBtn}>
              <Text style={styles.dateBtnText}>{dateDisplay} ▾</Text>
            </TouchableOpacity>
            <Text style={styles.dateLabel}>의 기록 {selectedEntry ? '(수정 중)' : ''}</Text>
          </View>

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

          <DatePickerModal 
            visible={showDatePicker}
            initialDate={safeDate}
            onClose={() => setShowDatePicker(false)}
            onSelect={handleDateChange}
          />
        </View>
      );
    }

    if (viewMode === 'diary-detail') {
      return <DiaryDetailScreen entry={selectedEntry} onSave={updateEntryDirectly} />;
    }
    
    if (viewMode === 'profile') {
      return <ProfileScreen userInfo={userInfo} onSave={handleProfileSave} onBack={() => setViewMode('main')} />;
    }

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
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  dateBtnText: { color: '#4F46E5', fontWeight: 'bold', fontSize: 16 },
  dateLabel: { color: '#6B7280', fontSize: 16, fontWeight: '600' },
  diaryInput: { 
    flex: 1, fontSize: 16, lineHeight: 24, textAlignVertical: 'top', 
    backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 20 
  },
  saveBtn: { 
    backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, 
    alignItems: 'center', shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }
  }
});