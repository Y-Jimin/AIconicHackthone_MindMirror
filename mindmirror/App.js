import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from './components/Header';
import TabBar from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import WriteSelectionScreen from './screens/WriteSelectionScreen';
import ChatScreen from './screens/ChatScreen';
import ReportScreen from './screens/ReportScreen';
import DiaryDetailScreen from './screens/DiaryDetailScreen';
import { INITIAL_ENTRIES } from './constants/data';
import { userAPI, diaryAPI, calendarAPI } from './services/api';

const USER_STORAGE_KEY = '@mindmirror_user';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [viewMode, setViewMode] = useState('main');
  const [diaryText, setDiaryText] = useState('');
  const [userId, setUserId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [isLoadingDiaries, setIsLoadingDiaries] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // 앱 시작 시 사용자 정보 로드 또는 생성
  useEffect(() => {
    loadOrCreateUser();
  }, []);

  // 사용자 ID가 로드되면 일기 목록 가져오기
  useEffect(() => {
    if (userId && userId !== 'default-user') {
      const now = new Date();
      loadDiaries(now.getFullYear(), now.getMonth() + 1);
    }
  }, [userId]);

  const loadOrCreateUser = async () => {
    try {
      // 저장된 사용자 ID 확인
      const savedUserId = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (savedUserId) {
        setUserId(savedUserId);
        setIsLoadingUser(false);
        return;
      }

      // 먼저 "테스트 사용자"를 찾아서 사용 (목업 데이터와 일치시키기 위해)
      try {
        const usersResponse = await userAPI.getUserByNickname('테스트 사용자');
        if (usersResponse.success && usersResponse.data && usersResponse.data._id) {
          const testUserId = usersResponse.data._id.toString();
          await AsyncStorage.setItem(USER_STORAGE_KEY, testUserId);
          setUserId(testUserId);
          setIsLoadingUser(false);
          console.log('테스트 사용자로 로그인:', testUserId);
          return;
        }
      } catch (error) {
        console.log('테스트 사용자를 찾을 수 없음, 새 사용자 생성:', error.message);
      }

      // 새 사용자 생성
      const response = await userAPI.createUser('사용자');
      if (response.success && response.data) {
        const newUserId = response.data._id || response.data.id;
        await AsyncStorage.setItem(USER_STORAGE_KEY, newUserId);
        setUserId(newUserId);
      }
    } catch (error) {
      console.error('User Load Error:', error);
      // 오류 발생 시 기본값 사용
      setUserId('default-user');
    } finally {
      setIsLoadingUser(false);
    }
  };

  const loadDiaries = async (year, month) => {
    if (!userId || userId === 'default-user') return;

    setIsLoadingDiaries(true);
    try {
      const now = new Date();
      const targetYear = year !== undefined ? year : now.getFullYear();
      const targetMonth = month !== undefined ? month : now.getMonth() + 1;

      console.log(`Loading diaries for ${targetYear}-${targetMonth}`);
      const response = await calendarAPI.getCalendarByMonth(userId, targetYear, targetMonth);
      console.log('Calendar API Response:', response);
      
      if (response.success && response.data) {
        // API 응답을 HomeScreen 형식으로 변환
        // 백엔드에서 이미 YYYY-MM-DD 형식의 date를 반환함
        const entries = response.data.map((item, index) => {
          // date를 문자열로 변환 (YYYY-MM-DD 형식)
          let dateStr = item.date;
          if (dateStr instanceof Date) {
            dateStr = dateStr.toISOString().split('T')[0];
          } else if (typeof dateStr === 'string' && !dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // 문자열이지만 형식이 맞지 않으면 변환
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              dateStr = date.toISOString().split('T')[0];
            }
          }
          
          // recordType이 없을 수 있으므로 기본값 사용
          // emotion을 mood로 변환 (MOODS에 있는 값으로 매핑)
          let mood = (item.emotion || 'Neutral').toLowerCase();
          // anxious는 stressed로 매핑
          if (mood === 'anxious') {
            mood = 'stressed';
          }
          // MOODS에 없는 값은 neutral로 기본값 설정
          const validMoods = ['happy', 'neutral', 'sad', 'stressed'];
          if (!validMoods.includes(mood)) {
            mood = 'neutral';
          }
          
          return {
            id: item._id || `entry-${index}-${dateStr}`,
            date: dateStr,
            type: item.recordType === 'chatbot' ? 'chat' : 'diary',
            mood: mood,
            summary: item.summary || '일기 기록',
            hasRecord: item.hasRecord !== false, // 백엔드에서 hasRecord가 false가 아니면 true
          };
        });
        console.log(`Loaded ${entries.length} entries:`, entries.map(e => `${e.date} (${e.mood})`));
        setDiaryEntries(entries);
      } else {
        console.log('No data in response');
        setDiaryEntries([]);
      }
    } catch (error) {
      console.error('Load Diaries Error:', error);
      // 오류 발생 시 빈 배열 사용
      setDiaryEntries([]);
    } finally {
      setIsLoadingDiaries(false);
    }
  };

  const handleMonthChange = (year, month) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    loadDiaries(year, month);
  };

  const handleSaveDiary = async () => {
    if (!diaryText.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const response = await diaryAPI.saveTextDiary(
        userId || 'default-user',
        diaryText.trim()
      );

      if (response.success) {
        // 일기 목록 새로고침
        await loadDiaries();

        Alert.alert('성공', '일기가 저장되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              setViewMode('main');
              setDiaryText('');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Save Diary Error:', error);
      Alert.alert(
        '저장 오류',
        error.message || '일기 저장에 실패했습니다. 잠시 후 다시 시도해주세요.',
        [{ text: '확인' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabChange = (tab) => {
    if (tab === 'write') {
      setViewMode('write-select');
    } else {
      setCurrentTab(tab);
      setViewMode('main');
    }
  };

  const renderContent = () => {
    if (viewMode === 'write-select') {
      return (
        <WriteSelectionScreen
          onSelect={(type) =>
            setViewMode(type === 'chat' ? 'write-chat' : 'write-diary')
          }
        />
      );
    }

    if (viewMode === 'write-chat') {
      return (
        <ChatScreen
          onFinish={async (saved) => {
            if (saved) {
              // 대화 저장 성공 시 일기 목록 새로고침
              await loadDiaries();
            }
            setViewMode('main');
          }}
          userId={userId}
        />
      );
    }

    if (viewMode === 'write-diary') {
      return (
        <View style={styles.diaryContainer}>
          <ScrollView style={styles.diaryScrollView}>
            <TextInput
              style={styles.diaryInput}
              placeholder="오늘의 이야기를 자유롭게 적어주세요..."
              placeholderTextColor="#D1D5DB"
              multiline
              value={diaryText}
              onChangeText={setDiaryText}
              autoFocus
            />
          </ScrollView>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveDiary}
            disabled={!diaryText.trim() || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>기록 저장하기</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (viewMode === 'diary-detail' && selectedDate) {
      return (
        <DiaryDetailScreen
          date={selectedDate}
          userId={userId}
          onBack={() => {
            setViewMode('main');
            setSelectedDate(null);
          }}
        />
      );
    }

    if (currentTab === 'home') {
      return (
        <HomeScreen
          entries={diaryEntries}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
          onDateSelect={(entry) => {
            if (entry && entry.date) {
              // 날짜 형식을 YYYY-MM-DD로 변환
              let dateStr = entry.date;
              if (typeof dateStr === 'string') {
                // 이미 문자열인 경우 그대로 사용
                // YYYY-MM-DD 형식인지 확인
                if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  // 형식이 맞지 않으면 Date 객체로 변환 후 다시 문자열로
                  const date = new Date(dateStr);
                  dateStr = date.toISOString().split('T')[0];
                }
                setSelectedDate(dateStr);
              } else {
                // Date 객체인 경우 문자열로 변환
                const date = new Date(dateStr);
                dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
                setSelectedDate(dateStr);
              }
              setViewMode('diary-detail');
            }
          }}
          onRefresh={() => {
            const now = new Date();
            const year = selectedYear || now.getFullYear();
            const month = selectedMonth || now.getMonth() + 1;
            loadDiaries(year, month);
          }}
          isLoading={isLoadingDiaries}
        />
      );
    }
    if (currentTab === 'report') {
      return <ReportScreen />;
    }
    return null;
  };

  const getHeaderTitle = () => {
    if (viewMode === 'write-select') return '기록하기';
    if (viewMode === 'write-chat') return 'AI 마인드 봇';
    if (viewMode === 'write-diary') return '오늘의 일기';
    if (viewMode === 'diary-detail') return '일기 상세';
    if (currentTab === 'home') return 'Mind Mirror';
    if (currentTab === 'report') return '분석 리포트';
    return '';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.statusBar}>
        <Text style={styles.statusBarText}>9:41</Text>
        <View style={styles.statusBarRight}>
          <View style={styles.battery} />
        </View>
      </View>

      <Header
        title={getHeaderTitle()}
        onBack={
          viewMode !== 'main'
            ? () => {
                if (viewMode === 'diary-detail') {
                  setSelectedDate(null);
                }
                setViewMode('main');
              }
            : null
        }
      />

      <View style={styles.content}>{renderContent()}</View>

      {viewMode === 'main' && (
        <TabBar currentTab={currentTab} setCurrentTab={handleTabChange} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  statusBar: {
    height: 40,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  statusBarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  battery: {
    width: 20,
    height: 10,
    backgroundColor: '#1F2937',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  diaryContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
  },
  diaryScrollView: {
    flex: 1,
  },
  diaryInput: {
    flex: 1,
    fontSize: 18,
    lineHeight: 28,
    color: '#374151',
    textAlignVertical: 'top',
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
});
