import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { MOODS } from '../constants/data';

const HomeScreen = ({ entries, onDateSelect }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const today = 24;

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="p-6 bg-white rounded-b-3xl shadow-sm">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">10월 24일 화요일</p>
            <h2 className="text-2xl font-bold text-gray-800">
              안녕하세요, <br/>
              <span className="text-indigo-600">민수</span>님! 👋
            </h2>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <User size={20} className="text-indigo-600" />
          </div>
        </div>

        {/* Monthly Mood Summary Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg mb-6 relative overflow-hidden">
          <Sparkles className="absolute top-2 right-2 text-white/20 w-24 h-24 -rotate-12" />
          <p className="text-indigo-100 text-xs font-medium mb-2">이번 달 기분 흐름</p>
          <h3 className="text-lg font-bold mb-1">대체로 행복했어요 🥰</h3>
          <p className="text-sm opacity-90">긍정적인 감정이 지난달보다 15% 늘었어요.</p>
        </div>

        {/* Calendar Grid */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg">10월의 기록</h3>
            <button className="text-xs text-gray-400 hover:text-indigo-600">전체보기</button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {['일', '월', '화', '수', '목', '금', '토'].map(d => (
              <div key={d} className="text-xs text-gray-400 font-medium mb-2">{d}</div>
            ))}
            {Array(2).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => {
              const entry = entries.find(e => parseInt(e.date.split('-')[2]) === day);
              const isToday = day === today;
              
              return (
                <button 
                  key={day} 
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center relative text-sm
                    ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'bg-transparent text-gray-700 hover:bg-gray-100'}
                    ${entry ? '' : 'opacity-50'}
                  `}
                  onClick={() => entry && onDateSelect(entry)}
                >
                  <span className={`z-10 ${isToday ? 'font-bold' : ''}`}>{day}</span>
                  {entry && (
                    <div className="absolute bottom-1 w-full flex justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        entry.mood === 'happy' ? 'bg-yellow-400' : 
                        entry.mood === 'stressed' ? 'bg-red-400' :
                        entry.mood === 'sad' ? 'bg-blue-400' : 'bg-gray-400'
                      }`} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="p-6">
        <h3 className="font-bold text-gray-800 text-lg mb-4">최근 기록</h3>
        <div className="space-y-3">
          {entries.slice().reverse().slice(0, 3).map(entry => (
            <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${MOODS[entry.mood].color} bg-opacity-20`}>
                {MOODS[entry.mood].icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-800 text-sm">{entry.summary}</span>
                  <span className="text-xs text-gray-400">{entry.date.slice(5)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className={`px-2 py-0.5 rounded-md bg-gray-100 ${entry.type === 'chat' ? 'text-indigo-500' : 'text-green-600'}`}>
                    {entry.type === 'chat' ? 'AI 대화' : '일기'}
                  </span>
                  <span>|</span>
                  <span>{MOODS[entry.mood].label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;