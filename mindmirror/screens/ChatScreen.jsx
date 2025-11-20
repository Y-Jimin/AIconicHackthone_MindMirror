import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';

const ChatScreen = ({ onFinish }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: '안녕하세요, 민수님! 오늘 하루는 어떠셨나요? 특별히 기억에 남는 일이 있으신가요? 😊' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI Response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: '아, 그러셨군요. 해커톤 준비 때문에 많이 바쁘셨겠어요. 스트레스를 받으시진 않았나요?' 
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0">
                <Sparkles size={14} className="text-indigo-600" />
              </div>
            )}
            <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                <Sparkles size={14} className="text-indigo-600" />
              </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white p-4 border-t border-gray-100 flex items-center gap-2 absolute bottom-0 w-full">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="메시지를 입력하세요..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim()}
          className={`p-3 rounded-full transition-colors ${input.trim() ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;