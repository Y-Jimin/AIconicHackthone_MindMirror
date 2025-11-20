import React from 'react';
import { Home, PenTool, BarChart2 } from 'lucide-react';

const TabBar = ({ currentTab, setCurrentTab }) => (
  <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 h-16 flex items-center justify-around pb-2 shadow-lg z-50">
    <button 
      onClick={() => setCurrentTab('home')}
      className={`flex flex-col items-center space-y-1 p-2 ${currentTab === 'home' ? 'text-indigo-600' : 'text-gray-400'}`}
    >
      <Home size={24} strokeWidth={currentTab === 'home' ? 2.5 : 2} />
      <span className="text-[10px] font-medium">홈</span>
    </button>
    <button 
      onClick={() => setCurrentTab('write')}
      className={`flex flex-col items-center space-y-1 p-2 -mt-6 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200 text-white`}
    >
      <PenTool size={24} />
    </button>
    <button 
      onClick={() => setCurrentTab('report')}
      className={`flex flex-col items-center space-y-1 p-2 ${currentTab === 'report' ? 'text-indigo-600' : 'text-gray-400'}`}
    >
      <BarChart2 size={24} strokeWidth={currentTab === 'report' ? 2.5 : 2} />
      <span className="text-[10px] font-medium">리포트</span>
    </button>
  </div>
);

export default TabBar;