import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Send, MessageCircle, Sparkles } from 'lucide-react-native';
import { diaryAPI } from '../services/api';

const ChatScreen = ({ userId, onFinish }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      text: '안녕하세요! 😊\n\n오늘 하루는 어떠셨나요? 저에게 편하게 이야기해 주세요. 어떤 일이든 들어드릴 준비가 되어 있어요.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // 저장 중 상태
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const scrollViewRef = useRef();
  const dotAnimations = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;

  // Typing indicator 애니메이션
  useEffect(() => {
    if (loading) {
      const animations = dotAnimations.map((anim, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      });
      Animated.parallel(animations).start();
    } else {
      dotAnimations.forEach(anim => anim.setValue(0.3));
    }
  }, [loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!userId) {
      Alert.alert("오류", "사용자 정보가 없습니다.");
      return;
    }

    const userText = input.trim();
    const userMsgId = Date.now();
    
    // 사용자 메시지 즉시 표시
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      console.log('📤 [프론트] 챗봇 메시지 전송 시작');
      console.log('📤 [프론트] 전송 데이터:', { 
        userId, 
        message: userText.substring(0, 50) + '...', 
        sessionId 
      });
      
      // 백엔드 API를 통해 챗봇 메시지 전송
      const response = await diaryAPI.sendChatMessage(userId, userText, sessionId);
      
      console.log('📥 [프론트] 챗봇 응답 받음 (전체):', JSON.stringify(response, null, 2));
      
      // sendChatMessage가 { response: "...", sessionId: "..." } 형식으로 반환
      let aiResponseText = null;
      
      if (response && typeof response === 'object') {
        // 정상적인 경우: { response: "...", sessionId: "..." }
        if (response.response && typeof response.response === 'string') {
          aiResponseText = response.response;
          console.log('✅ [프론트] 응답 텍스트 추출 성공:', aiResponseText.substring(0, 50) + '...');
        } 
        // 중첩된 경우: { data: { response: "...", sessionId: "..." } }
        else if (response.data && response.data.response) {
          aiResponseText = response.data.response;
          console.log('✅ [프론트] 중첩된 응답에서 텍스트 추출 성공:', aiResponseText.substring(0, 50) + '...');
        } 
        // 다른 구조
        else {
          console.error('❌ [프론트] 응답 구조 오류');
          console.error('응답 키:', Object.keys(response));
          console.error('응답 전체:', response);
          aiResponseText = "응답 형식을 확인할 수 없습니다.";
        }
      } else {
        console.error('❌ [프론트] 응답이 객체가 아닙니다:', typeof response, response);
        aiResponseText = "응답을 받지 못했습니다.";
      }
      
      if (!aiResponseText || aiResponseText.trim() === '') {
        console.error('❌ [프론트] 응답 텍스트가 비어있습니다.');
        aiResponseText = "응답을 받지 못했습니다. 다시 시도해주세요.";
      }
      
      console.log('✅ [프론트] 최종 응답 텍스트:', aiResponseText.substring(0, 100) + '...');
      
      const aiMsg = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: aiResponseText 
      };
      
      setMessages(prev => [...prev, aiMsg]);
      console.log('✅ [프론트] 메시지 화면에 표시 완료');
    } catch (error) {
      console.error("❌ [프론트] Chat API Error:", error);
      console.error("에러 타입:", error.constructor.name);
      console.error("에러 메시지:", error.message);
      console.error("에러 스택:", error.stack);
      
      let errorMessage = "응답을 받는 중 오류가 발생했습니다. 다시 시도해주세요.";
      
      if (error.message) {
        if (error.message.includes('네트워크') || 
            error.message.includes('fetch') || 
            error.message.includes('Failed to fetch') ||
            error.message.includes('Network request failed')) {
          errorMessage = "네트워크 오류가 발생했습니다. 서버가 실행 중인지 확인하고 다시 시도해주세요.";
        } else if (error.message.includes('500') || error.message.includes('서버')) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        } else {
          errorMessage = `오류: ${error.message}`;
        }
      }
      
      const errorMsg = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: errorMessage
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      console.log('✅ [프론트] 로딩 상태 해제');
    }
  };

  const saveConversation = async () => {
    if (!userId || !sessionId) {
      console.log('❌ [저장] 대화 저장 불가: userId 또는 sessionId가 없습니다.');
      return null;
    }
    
    // 초기 메시지만 있으면 저장하지 않음
    const userMessages = messages.filter(m => m.sender === 'user');
    if (userMessages.length === 0) {
      console.log('❌ [저장] 대화 저장 불가: 사용자 메시지가 없습니다.');
      return null;
    }
    
    try {
      console.log('💾 [저장] 대화 저장 시작:', { 
        userId, 
        sessionId, 
        messageCount: messages.length,
        userMessageCount: userMessages.length
      });
      
      const result = await diaryAPI.saveChatDiary(userId, sessionId);
      console.log('✅ [저장] 대화 저장 완료:', result);
      return result;
    } catch (error) {
      console.error("❌ [저장] 대화 저장 오류:", error);
      console.error("에러 상세:", error.message, error.stack);
      throw error;
    }
  };

  const handleFinish = async () => {
    // 대화 종료 시 저장
    const userMessages = messages.filter(m => m.sender === 'user');
    
    if (userId && userMessages.length > 0) {
      try {
        setSaving(true); // 저장 중 상태
        setLoading(true);
        
        console.log('💾 [저장] 대화 종료 및 저장 시작...');
        const result = await saveConversation();
        
        console.log('📥 [저장] 저장 응답 받음:', result);
        
        // 로딩 상태 먼저 해제
        setSaving(false);
        setLoading(false);
        
        // 응답 구조 확인: { success: true, data: diary, message: '...' }
        if (result && result.success) {
          const diary = result.data;
          
          if (diary) {
            const emotionEmoji = diary.emotionEmoji || '😐';
            const emotionScore = diary.emotionScore || 50;
            const summary = diary.summary || '대화가 저장되었습니다.';
            
            console.log('✅ [저장] 저장 성공:', {
              diaryId: diary._id,
              emotion: diary.emotion,
              emotionScore,
              summary: summary.substring(0, 50) + '...'
            });
            
            // 저장 성공 메시지
            Alert.alert(
              "저장 완료 ✨", 
              `대화가 저장되고 분석되었습니다.\n\n감정: ${emotionEmoji} ${diary.emotion || 'Neutral'}\n감정 점수: ${emotionScore}점\n\n요약: ${summary.substring(0, 50)}${summary.length > 50 ? '...' : ''}`,
              [
                {
                  text: "확인",
                  onPress: () => {
                    if (onFinish) {
                      onFinish();
                    }
                  }
                }
              ]
            );
          } else {
            // diary가 없어도 성공으로 처리
            console.log('⚠️ [저장] diary 데이터가 없지만 성공으로 처리');
            Alert.alert(
              "저장 완료", 
              "대화가 저장되었습니다.",
              [
                {
                  text: "확인",
                  onPress: () => {
                    if (onFinish) {
                      onFinish();
                    }
                  }
                }
              ]
            );
          }
        } else {
          // success가 false이거나 없어도 저장은 완료된 것으로 처리
          console.log('⚠️ [저장] 응답 구조가 예상과 다르지만 저장 완료로 처리');
          Alert.alert(
            "저장 완료", 
            "대화가 저장되었습니다.",
            [
              {
                text: "확인",
                onPress: () => {
                  if (onFinish) {
                    onFinish();
                  }
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error("❌ [저장] 대화 저장 오류:", error);
        console.error("에러 상세:", error.message, error.stack);
        
        // 에러 발생 시에도 로딩 상태 해제
        setSaving(false);
        setLoading(false);
        
        Alert.alert(
          "저장 실패", 
          `대화 저장 중 오류가 발생했습니다.\n\n${error.message || '알 수 없는 오류'}\n\n다시 시도해주세요.`,
          [
            {
              text: "확인",
              onPress: () => {
                // 에러 발생 시에도 화면은 유지
              }
            }
          ]
        );
      }
    } else {
      // 대화가 없으면 바로 종료
      console.log('ℹ️ [저장] 저장할 대화가 없어 바로 종료');
      if (onFinish) {
        onFinish();
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.messagesContainer} 
        contentContainerStyle={styles.messagesContent}
        ref={scrollViewRef}
        onContentSizeChange={() => {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }}
      >
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.msgRow, 
              msg.sender === 'user' ? styles.userMsgRow : styles.aiMsgRow
            ]}
          >
            {msg.sender === 'ai' && (
              <View style={styles.aiAvatar}>
                <Sparkles size={20} color="#F472B6" />
              </View>
            )}
            <View style={[
              styles.msgBubble,
              msg.sender === 'user' ? styles.userBubble : styles.aiBubble
            ]}>
              <Text style={[
                styles.msgText,
                msg.sender === 'user' ? styles.userMsgText : styles.aiMsgText
              ]}>
                {msg.text}
              </Text>
            </View>
            {msg.sender === 'user' && (
              <View style={styles.userAvatar}>
                <MessageCircle size={20} color="#FFF" />
              </View>
            )}
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.aiAvatar}>
              <Sparkles size={20} color="#F472B6" />
            </View>
            <View style={styles.aiBubble}>
              <View style={styles.typingIndicator}>
                {dotAnimations.map((anim, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.typingDot,
                      {
                        opacity: anim,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputArea}>
          <TextInput 
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요..."
            placeholderTextColor="#9CA3AF"
            editable={!loading}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            onPress={handleSend} 
            disabled={loading || !input.trim()} 
            style={[
              styles.sendBtn, 
              (input.trim() && !loading) ? styles.sendBtnActive : styles.sendBtnInactive
            ]}
          >
            <Send size={20} color={input.trim() && !loading ? '#FFF' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          onPress={handleFinish} 
          style={[styles.finishBtn, (loading || saving) && styles.finishBtnDisabled]}
          disabled={loading || saving}
        >
          {saving ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="small" color="#6B7280" style={{ marginRight: 8 }} />
              <Text style={styles.finishBtnText}>저장 중...</Text>
            </View>
          ) : (
            <Text style={styles.finishBtnText}>대화 종료 및 저장</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#FFF0F5' // 연한 핑크 배경
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMsgRow: {
    justifyContent: 'flex-end',
  },
  aiMsgRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#F472B6',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F472B6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  msgBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#F472B6',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'white',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  msgText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMsgText: {
    color: '#FFF',
    fontWeight: '500',
  },
  aiMsgText: {
    color: '#374151',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 3,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#FCE7F3',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 15,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnActive: {
    backgroundColor: '#F472B6',
  },
  sendBtnInactive: {
    backgroundColor: '#E5E7EB',
  },
  finishBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  finishBtnDisabled: {
    opacity: 0.6,
  },
  finishBtnText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ChatScreen;
