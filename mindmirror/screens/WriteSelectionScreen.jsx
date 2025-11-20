import React from 'react';
import { MessageSquare, PenTool } from 'lucide-react';

const WriteSelectionScreen = ({ onSelect }) => (
  <div className="flex flex-col h-full bg-white p-6 pt-12 animate-fade-in">
    <h2 className="text-2xl font-bold text-gray-800 mb-2">오늘 하루는<br/>어떠셨나요?</h2>
    <p className="text-gray-500 mb-10">편안한 방식을 선택해 기록해보세요.</p>

    <div className="space-y-4">
      <button 
        onClick={() => onSelect('chat')}
        className="w-full p-6 rounded-3xl bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-500 transition-all text-left group relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <MessageSquare size={80} className="text-indigo-600" />
        </div>
        <span className="inline-block p-3 bg-white rounded-2xl shadow-sm mb-4 text-indigo-600">
          <MessageSquare size={24} />
        </span>
        <h3 className="text-lg font-bold text-gray-800 mb-1">AI 챗봇과 대화하기</h3>
        <p className="text-sm text-gray-500">친구와 수다 떨듯 편안하게<br/>이야기하며 하루를 정리해요.</p>
      </button>

      <button 
        onClick={() => onSelect('diary')}
        className="w-full p-6 rounded-3xl bg-gray-50 border-2 border-gray-100 hover:border-gray-400 transition-all text-left group relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <PenTool size={80} className="text-gray-600" />
        </div>
        <span className="inline-block p-3 bg-white rounded-2xl shadow-sm mb-4 text-gray-600">
          <PenTool size={24} />
        </span>
        <h3 className="text-lg font-bold text-gray-800 mb-1">직접 일기 쓰기</h3>
        <p className="text-sm text-gray-500">차분한 마음으로 나만의 속도로<br/>오늘의 감정을 기록해요.</p>
      </button>
    </div>
  </div>
);

export default WriteSelectionScreen;