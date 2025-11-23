import React, { useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Send, Sparkles } from 'lucide-react-native';

const GEMINI_API_KEY = "YOUR_API_KEY_HERE"; 

const ChatScreen = ({ onFinish }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: '안녕하세요! 오늘 하루는 어떠셨나요? 저에게 편하게 이야기해 주세요. 😊' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const callGemini = async (userMessage) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
      return "API 키가 설정되지 않았어요. 코드에서 키를 입력해주세요!";
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage }] }]
          })
        }
      );
      const data = await response.json();
      if (data.error) return `에러: ${data.error.message}`;
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error(error);
      return "죄송해요, 연결에 문제가 생겼어요.";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    const aiResponseText = await callGemini(userText);
    setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiResponseText }]);
    setLoading(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView 
        style={{ flex: 1, padding: 16 }} 
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[
            styles.msgRow, 
            msg.sender === 'user' ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }
          ]}>
            {msg.sender === 'ai' && (
              <View style={styles.aiAvatar}>
                <Image source={require('../../assets/gemini.png')} style={{ width: 25, height: 25 }} />
              </View>
            )}
            <View style={[
              styles.msgBubble,
              msg.sender === 'user' ? styles.userBubble : styles.aiBubble
            ]}>
              <Text style={msg.sender === 'user' ? { color: '#FFF' } : { color: '#374151' }}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
           <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginBottom: 20 }}>
             <ActivityIndicator size="small" color="#F472B6" />
             <Text style={{ marginLeft: 8, color: '#6B7280', fontSize: 12 }}>AI가 작성 중...</Text>
           </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput 
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor="#9CA3AF"
          editable={!loading}
        />
        <TouchableOpacity 
          onPress={handleSend} 
          disabled={loading} 
          style={[
            styles.sendBtn, 
            input.trim() ? { backgroundColor: '#F472B6' } : { backgroundColor: '#E5E7EB' }
          ]}
        >
          <Image 
            source={require('../../assets/send.png')} 
            style={[
              styles.sendIcon, 
              { tintColor: input.trim() ? '#FFF' : '#9CA3AF' }
            ]} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffffff' },
  msgRow: { flexDirection: 'row', marginBottom: 16 },
  aiAvatar: { width: 40, height: 40, borderRadius: 27, backgroundColor: '#FCE7F3', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  msgBubble: { padding: 12, borderRadius: 16, maxWidth: '80%' },
  userBubble: { backgroundColor: '#F472B6', borderBottomRightRadius: 0 },
  aiBubble: { backgroundColor: 'white', borderTopLeftRadius: 0, borderWidth: 1, borderColor: '#F3F4F6' },
  
  inputArea: { 
    padding: 8, // 기존 16에서 8로 축소
    backgroundColor: 'white', 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  
  // [수정] 입력창 스타일: 높이 40으로 축소, 텍스트 수직 중앙 정렬 설정
  textInput: { 
    flex: 1, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    height: 40, // [핵심] 높이를 40으로 고정 (슬림화)
    marginRight: 10,
    color: '#374151',
    // 텍스트 수직 중앙 정렬 핵심 속성
    paddingTop: 0,    
    paddingBottom: 0,
    textAlignVertical: 'center', // 안드로이드용 중앙 정렬
    includeFontPadding: false,   // 안드로이드 폰트 패딩 제거
  },
  
  // [수정] 전송 버튼 크기 및 이미지 스타일
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { width: 20, height: 20, resizeMode: 'contain' }
});

export default ChatScreen;
