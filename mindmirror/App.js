import React, { useState } from 'react';
import { Activity } from 'lucide-react';

// Components & Screens Import (상대 경로에 주의하세요)
import Header from './components/Header';
import TabBar from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import WriteSelectionScreen from './screens/WriteSelectionScreen';
import ChatScreen from './screens/ChatScreen';
import ReportScreen from './screens/ReportScreen';

// Data Import
import { INITIAL_ENTRIES } from './constants/data';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [viewMode, setViewMode] = useState('main'); // main, write-select, write-chat, write-diary
  
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
      return <WriteSelectionScreen onSelect={(type) => setViewMode(type === 'chat' ? 'write-chat' : 'write-diary')} />;
    }
    
    if (viewMode === 'write-chat') {
      return <ChatScreen onFinish={() => setViewMode('main')} />;
    }

    // Placeholder for Diary text input mode
    if (viewMode === 'write-diary') {
      return (
         <div className="p-6 animate-fade-in h-full flex flex-col">
           <textarea 
            placeholder="오늘의 이야기를 자유롭게 적어주세요..." 
            className="w-full flex-1 resize-none text-lg leading-relaxed focus:outline-none text-gray-700 placeholder-gray-300"
            autoFocus
           />
           <button onClick={() => setViewMode('main')} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold mt-4 shadow-lg shadow-indigo-200">
             기록 저장하기
           </button>
         </div>
      );
    }

    // Tab Navigation Content
    if (currentTab === 'home') {
      return <HomeScreen entries={INITIAL_ENTRIES} onDateSelect={() => {}} />;
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
    if (currentTab === 'home') return 'Mind Mirror';
    if (currentTab === 'report') return '분석 리포트';
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      {/* Mobile Container Wrapper */}
      <div className="w-full max-w-md h-screen sm:h-[850px] bg-white sm:rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col border-4 border-gray-900/5">
        
        {/* Status Bar Simulation */}
        <div className="h-10 bg-white w-full flex items-center justify-between px-6 pt-2 sticky top-0 z-50 text-xs font-semibold text-gray-900">
           <span>9:41</span>
           <div className="flex gap-1.5 items-center">
             <Activity size={12} />
             <div className="w-5 h-2.5 bg-gray-900 rounded-full" />
           </div>
        </div>

        <Header 
          title={getHeaderTitle()} 
          onBack={viewMode !== 'main' ? () => setViewMode('main') : null}
        />

        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative">
          {renderContent()}
        </div>

        {viewMode === 'main' && (
          <TabBar currentTab={currentTab} setCurrentTab={handleTabChange} />
        )}
      </div>
    </div>
  );
}
