import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, BackHandler, ActivityIndicator } from 'react-native';

import Header from './src/components/Header';
import TabBar from './src/components/TabBar';
import HomeScreen from './src/screens/HomeScreen';
import WriteSelectionScreen from './src/screens/WriteSelectionScreen';
import ChatScreen from './src/screens/ChatScreen';
import ReportScreen from './src/screens/ReportScreen';
import DiaryDetailScreen from './src/screens/DiaryDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen'; 
import DatePickerModal from './src/components/DatePickerModal'; 

import { userAPI, diaryAPI, calendarAPI, dateHelpers } from './src/services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [viewMode, setViewMode] = useState('main'); 
  
  const [entries, setEntries] = useState([]);
  const [tempDiaryText, setTempDiaryText] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null); 

  const [writingDate, setWritingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: '민수',
    birthday: '', 
    photo: false 
  });
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date(); 
  };

  const goBack = () => {
    if (viewMode === 'diary-detail' || viewMode === 'profile') {
      setViewMode('main');
      // 메인 화면으로 돌아갈 때 데이터 리로드
      if (userId) {
        loadAllDiaries();
      }
    } else if (viewMode === 'write-chat' || viewMode === 'write-diary') {
      setSelectedEntry(null);
      setTempDiaryText('');
      setViewMode('write-select');
    } else if (viewMode === 'write-select') {
      setViewMode('main'); 
      setCurrentTab('home');
      // 메인 화면으로 돌아갈 때 데이터 리로드
      if (userId) {
        loadAllDiaries();
      }
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

  // 초기 사용자 설정 및 데이터 로드
  useEffect(() => {
    initializeUser();
  }, []);

  // 프론트 시작 시 모든 일기 데이터 로드
  useEffect(() => {
    if (userId) {
      console.log('🚀 프론트 시작: 모든 일기 데이터 로드 시작, userId:', userId);
      loadAllDiaries();
    }
  }, [userId]);

  // 홈 화면이 표시될 때마다 데이터 리로드 (탭 전환, 화면 모드 변경 시)
  useEffect(() => {
    if (userId && currentTab === 'home' && viewMode === 'main') {
      console.log('🔄 [자동 리로드] 홈 화면 표시: 최신 DB 데이터 로드');
      loadAllDiaries();
    }
  }, [currentTab, viewMode, userId]);

  // 월 변경 시 - 실제 DB 데이터만 사용하므로 별도 로드 불필요
  // (모든 일기 데이터는 이미 loadAllDiaries에서 로드됨)

  const initializeUser = async () => {
    try {
      setLoading(true);
      
      console.log('👤 사용자 초기화 시작: 일기가 있는 사용자 찾기');
      
      try {
        // 일기가 있는 사용자를 먼저 찾기
        const userWithDiaries = await userAPI.getUserWithDiaries();
        console.log('👤 일기가 있는 사용자 찾음:', userWithDiaries);
        
        const userIdValue = userWithDiaries._id || userWithDiaries.id;
        setUserId(userIdValue);
        setUserInfo({
          name: userWithDiaries.nickname || '사용자',
          birthday: '',
          photo: false,
        });
        console.log('👤 userId 설정됨:', userIdValue, '닉네임:', userWithDiaries.nickname);
        console.log('👤 일기 개수:', userWithDiaries.diaryCount || '알 수 없음');
      } catch (error) {
        console.log('👤 일기가 있는 사용자 없음, 기본 사용자 생성 시도:', error.message);
        
        // 일기가 있는 사용자가 없으면 기본 닉네임으로 사용자 생성/조회
        const defaultNickname = '민수';
        
        try {
          // 기존 사용자 조회 시도
          const existingUser = await userAPI.getUserByNickname(defaultNickname);
          console.log('👤 기존 사용자 찾음:', existingUser);
          const userIdValue = existingUser._id || existingUser.id;
          setUserId(userIdValue);
          setUserInfo({
            name: existingUser.nickname || defaultNickname,
            birthday: '',
            photo: false,
          });
          console.log('👤 userId 설정됨:', userIdValue);
        } catch (error2) {
          console.log('👤 기존 사용자 없음, 새로 생성:', error2.message);
          // 사용자가 없으면 새로 생성
          const newUser = await userAPI.createUser(defaultNickname);
          console.log('👤 새 사용자 생성됨:', newUser);
          const userIdValue = newUser._id || newUser.id;
          setUserId(userIdValue);
          setUserInfo({
            name: newUser.nickname || defaultNickname,
            birthday: '',
            photo: false,
          });
          console.log('👤 userId 설정됨:', userIdValue);
        }
      }
    } catch (error) {
      console.error('🔴 사용자 초기화 오류:', error);
      Alert.alert('오류', `사용자 정보를 불러오는 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 모든 일기 데이터를 한 번에 로드 (프론트 시작 시 및 화면 전환 시)
  const loadAllDiaries = async () => {
    if (!userId) {
      console.log('❌ [리로드] loadAllDiaries: userId가 없습니다.');
      return;
    }
    
    try {
      console.log('📚 [리로드] 모든 일기 데이터 로드 시작... userId:', userId);
      const allDiaries = await calendarAPI.getAllDiaries(userId);
      console.log('📚 [리로드] 받아온 전체 일기 개수:', allDiaries?.length || 0);
      
      if (!allDiaries || !Array.isArray(allDiaries)) {
        console.log('⚠️ [리로드] 일기 데이터가 배열이 아니거나 없습니다. 빈 배열로 설정합니다.');
        // 데이터가 없으면 빈 배열로 설정 (삭제된 데이터 반영)
        setEntries([]);
        return;
      }
      
      // 모든 일기를 entries 형식으로 변환
      const convertedEntries = allDiaries.map(diary => {
        const entry = dateHelpers.diaryToEntry(diary);
        return entry;
      });
      
      console.log(`✅ [리로드] 총 ${convertedEntries.length}개의 일기 데이터 로드 완료`);
      if (convertedEntries.length > 0) {
        console.log(`📅 [리로드] 로드된 날짜들:`, convertedEntries.map(e => e.date).slice(0, 10).join(', '));
        
        // 11월 23일 일기가 있는지 확인
        const nov23Entries = convertedEntries.filter(e => {
          const dateParts = e.date.split('/');
          return dateParts[0] === '2024' && dateParts[1] === '11' && dateParts[2] === '23';
        });
        
        if (nov23Entries.length > 0) {
          console.log(`⚠️ [리로드] 11월 23일 일기 발견: ${nov23Entries.length}개`);
          nov23Entries.forEach((entry, index) => {
            console.log(`  [${index + 1}] ID: ${entry.id}, 타입: ${entry.type}, 요약: ${entry.summary?.substring(0, 50)}...`);
            if (entry.content && (entry.content.includes('과제') || entry.content.includes('우울'))) {
              console.log(`      ⚠️ "과제" 또는 "우울" 키워드 발견!`);
            }
          });
        } else {
          console.log(`✅ [리로드] 11월 23일 일기 없음 (정상)`);
        }
      }
      
      // entries에 설정 (기존 데이터는 모두 교체, DB에서 로드한 실제 데이터만)
      // 이렇게 하면 DB에서 삭제된 데이터는 화면에서도 사라짐
      setEntries(convertedEntries);
      
      // 실제 DB 데이터만 사용 - 하드코딩된 캘린더 데이터는 사용하지 않음
    } catch (error) {
      console.error('❌ [리로드] 전체 일기 데이터 로드 오류:', error);
      console.error('에러 상세:', error.message, error.stack);
      // 에러 발생 시에도 빈 배열로 설정하여 오래된 데이터가 표시되지 않도록
      setEntries([]);
    }
  };

  // loadCalendarData 함수 제거 - 실제 DB 데이터만 사용하므로 불필요
  // 모든 일기 데이터는 loadAllDiaries에서 한 번에 로드되며,
  // 캘린더 색상 표시는 실제 DB 데이터의 mood/emotion 정보로 충분함

  const loadDateDiaries = async (dateStr) => {
    if (!userId) {
      console.log('loadDateDiaries: userId가 없습니다.');
      return;
    }
    
    try {
      const dateForAPI = dateHelpers.toYYYYMMDDFromSlash(dateStr);
      console.log('날짜별 일기 로드:', dateStr, '->', dateForAPI, 'userId:', userId);
      
      const diaries = await calendarAPI.getDateDiaries(userId, dateForAPI);
      console.log('받아온 일기 개수:', diaries?.length || 0, diaries);
      
      if (!diaries || diaries.length === 0) {
        console.log('해당 날짜에 일기가 없습니다.');
        return;
      }
      
      // 해당 날짜의 일기들을 entries에 추가/업데이트
      const convertedEntries = diaries.map(diary => {
        const entry = dateHelpers.diaryToEntry(diary);
        console.log('변환된 일기:', entry);
        return entry;
      });
      
      setEntries(prev => {
        // 해당 날짜의 실제 일기 데이터만 제거 (캘린더 데이터는 유지)
        const filtered = prev.filter(e => !(e.date === dateStr && !e.isCalendarData));
        // 실제 일기 데이터 추가
        const merged = [...filtered, ...convertedEntries];
        console.log('병합된 entries:', merged.filter(e => e.date === dateStr));
        return merged;
      });
    } catch (error) {
      console.error('날짜별 일기 로드 오류:', error);
      // 에러가 발생해도 빈 배열로 처리 (일기가 없는 경우)
    }
  };

  const getDateStr = (dateObj) => {
    const d = (dateObj instanceof Date && !isNaN(dateObj)) ? dateObj : new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleWriteDiary = () => {
    const today = new Date();
    const todayStr = getDateStr(today);
    checkEntryAndNavigate(todayStr, today);
  };

  const checkEntryAndNavigate = (dateStr, dateObj) => {
    // 텍스트 일기만 찾기 (챗봇 일기는 제외)
    // type이 'diary'이고 recordType이 'text'인 것만 찾거나, type이 'diary'인 것만 찾기
    const existingTextDiary = entries.find(e => {
      if (e.date !== dateStr) return false;
      // type이 'diary'인 것만 (챗봇은 'chat' 타입)
      if (e.type !== 'diary') return false;
      // 추가 확인: recordType이 있으면 'text'인 것만
      if (e.recordType && e.recordType !== 'text') return false;
      return true;
    });
    
    console.log('📝 [일기 쓰기] 날짜:', dateStr, '기존 텍스트 일기:', existingTextDiary ? '있음' : '없음');
    
    setWritingDate(dateObj);
    if (existingTextDiary) {
      console.log('📝 [일기 쓰기] 기존 텍스트 일기 발견, 수정 모드로 진입');
      editEntry(existingTextDiary); 
    } else {
      console.log('📝 [일기 쓰기] 새 텍스트 일기 작성 모드로 진입');
      setSelectedEntry(null);
      setTempDiaryText('');
      setViewMode('write-diary');
    }
  };

  const editEntry = (entry) => {
    setSelectedEntry(entry); 
    setTempDiaryText(entry.content); 
    setWritingDate(parseDate(entry.date)); 
    setViewMode('write-diary');
  };

  const handleDateChange = async (newDateStr) => {
    const newDateObj = parseDate(newDateStr);
    setWritingDate(newDateObj);

    // 해당 날짜의 일기 로드
    await loadDateDiaries(newDateStr);
    
    // 텍스트 일기만 찾기 (챗봇 일기는 제외)
    const existingTextDiary = entries.find(e => {
      if (e.date !== newDateStr) return false;
      if (e.type !== 'diary') return false;
      // recordType이 있으면 'text'인 것만
      if (e.recordType && e.recordType !== 'text') return false;
      return true;
    });

    if (existingTextDiary) {
      console.log('📝 [날짜 변경] 기존 텍스트 일기 발견, 수정 모드로 전환');
      editEntry(existingTextDiary);
    } else {
      console.log('📝 [날짜 변경] 새 텍스트 일기 작성 모드');
      if (selectedEntry) {
        setSelectedEntry(null); 
        setTempDiaryText(''); 
      }
    }
  };

  const updateEntryDirectly = async (id, newContent) => {
    if (!userId) {
      Alert.alert("오류", "사용자 정보가 없습니다.");
      return;
    }

    try {
      const entry = entries.find(e => e.id === id);
      if (!entry) {
        Alert.alert("오류", "일기를 찾을 수 없습니다.");
        return;
      }

      const dateForAPI = dateHelpers.toYYYYMMDDFromSlash(entry.date);
      
      // 백엔드에 일기 저장 (수정)
      await diaryAPI.saveTextDiary(userId, newContent, dateForAPI);
      
      // 로컬 상태 업데이트
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
      
      // 실제 DB 데이터 다시 로드
      await loadAllDiaries();
      
      Alert.alert("수정 완료", "내용이 저장되었습니다.");
    } catch (error) {
      console.error('일기 수정 오류:', error);
      Alert.alert("오류", "일기 수정 중 오류가 발생했습니다.");
    }
  };

  const saveDiary = async () => {
    if (!tempDiaryText.trim()) {
      Alert.alert("알림", "내용을 입력해주세요.");
      return;
    }

    if (!userId) {
      Alert.alert("오류", "사용자 정보가 없습니다.");
      return;
    }

    const targetDateStr = getDateStr(writingDate);
    const dateForAPI = dateHelpers.toYYYYMMDDFromSlash(targetDateStr);

    try {
      // 백엔드에 일기 저장
      const savedDiary = await diaryAPI.saveTextDiary(userId, tempDiaryText, dateForAPI);
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const convertedEntry = dateHelpers.diaryToEntry(savedDiary);

      if (selectedEntry) {
        // 수정 모드
        setEntries(prev => prev.map(item => {
          if (item.id === selectedEntry.id) {
            return convertedEntry;
          }
          return item;
        }));
        Alert.alert("수정 완료", "일기가 수정되었습니다.");
      } else {
        // 새로 작성
        // 텍스트 일기만 찾기 (챗봇 일기는 제외)
        const doubleCheck = entries.find(e => {
          if (e.date !== targetDateStr) return false;
          if (e.type !== 'diary') return false;
          // recordType이 있으면 'text'인 것만
          if (e.recordType && e.recordType !== 'text') return false;
          return true;
        });
        
        if (doubleCheck) {
          // 이미 존재하면 덮어쓰기
          console.log('📝 [저장] 기존 텍스트 일기 덮어쓰기');
          setEntries(prev => prev.map(item => {
            if (item.id === doubleCheck.id) {
              return convertedEntry;
            }
            return item;
          }));
          Alert.alert("수정 완료", "기존 일기에 덮어썼습니다.");
        } else {
          console.log('📝 [저장] 새 텍스트 일기 추가');
          setEntries(prev => [...prev, convertedEntry]);
          Alert.alert("저장 완료", `${targetDateStr}에 일기가 저장되었습니다!`);
        }
      }

      // 실제 DB 데이터 다시 로드
      await loadAllDiaries();

      setTempDiaryText('');
      setSelectedEntry(null);
      setViewMode('main');
      setCurrentTab('home');
    } catch (error) {
      console.error('일기 저장 오류:', error);
      Alert.alert("오류", "일기 저장 중 오류가 발생했습니다.");
    }
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
    if (viewMode === 'write-chat') return <ChatScreen userId={userId} onFinish={async () => {
      // 챗봇 종료 시 실제 DB 데이터 다시 로드
      if (userId) {
        await loadAllDiaries();
      }
      setViewMode('main');
    }} />;
    if (viewMode === 'write-diary') {
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
      return <DiaryDetailScreen 
        entry={selectedEntry} 
        onSave={updateEntryDirectly}
        onBack={() => {
          setViewMode('main');
          // 메인 화면으로 돌아갈 때 데이터 리로드
          if (userId) {
            loadAllDiaries();
          }
        }}
      />;
    }
    
    if (viewMode === 'profile') {
      return <ProfileScreen 
        userInfo={userInfo} 
        onSave={handleProfileSave} 
        onBack={() => {
          setViewMode('main');
          // 메인 화면으로 돌아갈 때 데이터 리로드
          if (userId) {
            loadAllDiaries();
          }
        }} 
      />;
    }

    if (currentTab === 'report') {
      return <ReportScreen userId={userId} />;
    }
    
    return <HomeScreen 
      entries={entries} 
      userInfo={userInfo}
      onDateSelect={async (dateStr) => {
        // 날짜 선택 시 - 항상 최신 데이터 로드
        console.log('📅 날짜 선택:', dateStr, '- 최신 데이터 로드');
        await loadAllDiaries(); // 전체 데이터 리로드
        await loadDateDiaries(dateStr); // 해당 날짜 상세 로드
      }} 
      onEntrySelect={async (entry) => {
        // 일기 상세 보기 전에 최신 데이터 로드
        console.log('📖 일기 선택:', entry.id, '- 최신 데이터 로드');
        await loadAllDiaries(); // 전체 데이터 리로드
        await loadDateDiaries(entry.date); // 해당 날짜 상세 로드
        const updatedEntry = entries.find(e => e.id === entry.id) || entry;
        setSelectedEntry(updatedEntry);
        setViewMode('diary-detail');
      }}
      onProfilePress={() => setViewMode('profile')}
      onMonthChange={(newMonth) => {
        setCurrentMonth(newMonth);
        // 월 변경 시에도 최신 데이터 로드
        if (userId) {
          console.log('📅 월 변경:', newMonth, '- 최신 데이터 리로드');
          loadAllDiaries();
        }
      }}
    />;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={{ marginTop: 16, color: '#6B7280' }}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          if(tab === 'write') {
            setViewMode('write-select');
          } else {
            setViewMode('main');
            // 홈 탭으로 전환 시 데이터 리로드
            if (tab === 'home' && userId) {
              loadAllDiaries();
            }
          }
        }} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff' }, // 메인 배경색 핑크
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateBtn: { backgroundColor: '#FCE7F3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  dateBtnText: { color: '#F472B6', fontWeight: 'bold', fontSize: 16 },
  dateLabel: { color: '#6B7280', fontSize: 16, fontWeight: '600' },
  diaryInput: { flex: 1, fontSize: 16, lineHeight: 24, textAlignVertical: 'top', backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 20 },
  saveBtn: { backgroundColor: '#F472B6', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#F472B6', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 } }
});