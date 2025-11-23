import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { diaryAPI } from '../services/api';

const ChatScreen = ({ onFinish, userId }) => {
  // 세션 ID 생성 (채팅 세션별로 고유)
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: '안녕하세요! 오늘 하루는 어떠셨나요? 특별히 기억에 남는 일이 있으신가요? 😊',
      role: 'assistant',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: userMessage,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    // 사용자 메시지를 먼저 화면에 표시
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Gemini API 호출 (sessionId 전달, 서버에서 DB에서 히스토리 가져옴)
      const response = await diaryAPI.sendChatMessage(
        userId || 'default-user',
        userMessage,
        sessionId
      );

      setIsTyping(false);
      setIsLoading(false);

      if (response.success && response.data && response.data.response) {
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: response.data.response,
          role: 'assistant',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error('AI 응답을 받지 못했습니다.');
      }
    } catch (error) {
      setIsTyping(false);
      setIsLoading(false);
      console.error('Chat API Error:', error);
      
      // 에러 메시지 제거하고 사용자에게 알림
      setMessages((prev) => prev.filter((msg) => msg.id !== newMsg.id));
      
      Alert.alert(
        '오류',
        error.message || '메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.',
        [{ text: '확인' }]
      );
    }
  };

  const handleFinish = async () => {
    try {
      if (messages.length <= 1) {
        // 대화가 없으면 그냥 종료
        if (onFinish) onFinish(false);
        return;
      }

      // 대화 저장 (sessionId 사용, 서버에서 Chat 테이블에서 가져옴)
      setIsLoading(true);
      const response = await diaryAPI.saveChatDiary(
        userId || 'default-user',
        sessionId
      );
      setIsLoading(false);

      if (response.success && onFinish) {
        // 저장 성공 시 콜백 호출 (홈 화면 새로고침을 위해)
        onFinish(true);
      } else if (onFinish) {
        onFinish(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Save Chat Error:', error);
      Alert.alert(
        '저장 오류',
        error.message || '대화 저장에 실패했습니다.',
        [{ text: '확인', onPress: () => onFinish && onFinish(false) }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.sender === 'user' && styles.messageRowUser,
            ]}
          >
            {msg.sender === 'ai' && (
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color="#4F46E5" />
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                msg.sender === 'user'
                  ? styles.messageBubbleUser
                  : styles.messageBubbleAi,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.sender === 'user' && styles.messageTextUser,
                ]}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
        {isTyping && (
          <View style={styles.messageRow}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={14} color="#4F46E5" />
            </View>
            <View style={[styles.messageBubble, styles.messageBubbleAi]}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#4F46E5" />
              ) : (
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, { animationDelay: '0s' }]} />
                  <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
                  <View style={[styles.typingDot, { animationDelay: '0.4s' }]} />
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor="#9CA3AF"
          multiline
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
          style={[
            styles.sendButton,
            (!input.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons
              name="send"
              size={20}
              color={input.trim() ? '#FFFFFF' : '#9CA3AF'}
            />
          )}
        </TouchableOpacity>
        {messages.length > 1 && (
          <TouchableOpacity
            onPress={handleFinish}
            style={styles.finishButton}
            disabled={isLoading}
          >
            <Text style={styles.finishButtonText}>저장하고 종료</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 14,
    borderRadius: 16,
  },
  messageBubbleUser: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  messageBubbleAi: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  finishButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ChatScreen;
