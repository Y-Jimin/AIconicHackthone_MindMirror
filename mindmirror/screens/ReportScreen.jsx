import React from 'react';
import { TrendingUp, Sparkles, Lock } from 'lucide-react';
import { WEEKLY_STATS, KEYWORDS } from '../constants/data';

const ReportScreen = () => (
  <div className="pb-24 bg-gray-50 min-h-screen">
    <div className="p-6 bg-white rounded-b-3xl shadow-sm mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">주간 마음 리포트</h2>
      <p className="text-sm text-gray-500 mb-6">10월 3주차 (10.16 ~ 10.22)</p>
      
      {/* Chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            감정 변동 추이
          </h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">높을수록 긍정</span>
        </div>
        <div className="h-40 flex items-end justify-between gap-2">
          {WEEKLY_STATS.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center w-full group">
              <div 
                className={`w-full rounded-t-lg transition-all duration-500 relative group-hover:opacity-80
                  ${stat.score < 40 ? 'bg-red-400' : stat.score > 70 ? 'bg-indigo-400' : 'bg-gray-300'}
                `}
                style={{ height: `${stat.score}%` }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {stat.score}점
                </div>
              </div>
              <span className="text-xs text-gray-400 mt-2">{stat.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="px-6 space-y-6">
      {/* Keywords */}
      <div>
        <h3 className="font-bold text-gray-800 mb-3 text-lg">주요 감정 키워드</h3>
        <div className="flex flex-wrap gap-2">
          {KEYWORDS.map((k, i) => (
            <div key={i} className={`px-4 py-2 rounded-full text-sm font-medium ${k.color}`}>
              #{k.word} <span className="opacity-60 text-xs ml-1">{k.count}회</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Text */}
      <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl relative">
        <Sparkles className="absolute top-4 right-4 text-indigo-300" size={20} />
        <h3 className="font-bold text-indigo-900 mb-2">AI 분석 코멘트</h3>
        <p className="text-sm text-indigo-800 leading-relaxed">
          이번 주는 <strong>'해커톤'</strong>과 관련된 활동이 많아 성취감이 높았지만, 수요일에는 일시적으로 스트레스가 높아졌네요. 
          충분한 휴식이 창의력에 도움이 됩니다. 주말에는 <strong>'커피'</strong> 대신 따뜻한 차를 마시며 휴식을 취해보는 건 어떨까요?
        </p>
      </div>

      {/* Premium Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-900 p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-indigo-300">
            <Lock size={16} />
            <span className="text-xs font-bold tracking-wider uppercase">Premium</span>
          </div>
          <h3 className="text-xl font-bold mb-2">월간 심층 리포트</h3>
          <p className="text-sm text-gray-400 mb-4">정신과 상담에도 활용 가능한<br/>전문 데이터 분석을 받아보세요.</p>
          <button className="w-full py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm">
            상세 리포트 잠금 해제
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ReportScreen;
