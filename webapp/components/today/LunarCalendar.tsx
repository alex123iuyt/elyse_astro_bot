"use client";

import { useState } from 'react';

interface MoonPhase {
  date: string;
  phase: string;
  sign: string;
  icon: string;
}

interface LunarData {
  currentPhase: {
    name: string;
    percentage: number;
    sign: string;
    date: string;
  };
  monthRange: {
    start: string;
    end: string;
  };
  phases: MoonPhase[];
}

interface LunarCalendarProps {
  lunarData: LunarData;
}

export default function LunarCalendar({ lunarData }: LunarCalendarProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'calendar'>('today');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const handleOpenDetails = () => {
    setIsBottomSheetOpen(true);
  };

  const handleCloseDetails = () => {
    setIsBottomSheetOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Main Lunar Calendar Card */}
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <div className="text-sm text-zinc-400 mb-2">ЛУННЫЙ КАЛЕНДАРЬ</div>
        
        {/* Date Range */}
        <div className="text-sm text-zinc-400 mb-4">
          {formatDate(lunarData.monthRange.start)} — {formatDate(lunarData.monthRange.end)}
        </div>

        {/* Current Phase */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-4xl">🌙</div>
          <div>
            <h2 className="text-2xl font-bold text-white">{lunarData.currentPhase.name}</h2>
            <div className="text-emerald-400 font-medium">Луна в {lunarData.currentPhase.sign}</div>
          </div>
        </div>

        {/* Phase Icons */}
        <div className="flex justify-between mb-6">
          {lunarData.phases.map((phase, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl mb-1">{phase.icon}</div>
              <div className="text-xs text-zinc-400">{formatDate(phase.date)}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-800 rounded-lg p-1 mb-6">
          {(['today', 'tomorrow', 'calendar'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {tab === 'today' ? 'Сегодня' : tab === 'tomorrow' ? 'Завтра' : 'Календарь'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'today' && (
          <div className="text-center">
            <p className="text-zinc-300 text-sm mb-4">
              Сегодняшняя лунная энергия поддерживает {lunarData.currentPhase.name.toLowerCase()} деятельность
            </p>
            <button
              onClick={handleOpenDetails}
              className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-6 rounded-xl transition-colors font-medium"
            >
              Больше подробностей
            </button>
          </div>
        )}

        {activeTab === 'tomorrow' && (
          <div className="text-center">
            <p className="text-zinc-300 text-sm mb-4">
              Завтрашняя лунная фаза будет другой
            </p>
            <button
              onClick={handleOpenDetails}
              className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-6 rounded-xl transition-colors font-medium"
            >
              Посмотреть детали завтра
            </button>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="grid grid-cols-7 gap-2">
            {lunarData.phases.map((phase, index) => (
              <div key={index} className="text-center p-2 rounded-lg">
                <div className="text-lg mb-1">{phase.icon}</div>
                <div className="text-xs text-zinc-400">{formatDate(phase.date)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet - будет добавлен позже */}
      {isBottomSheetOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-zinc-900 rounded-t-3xl w-full p-6">
            <div className="text-white text-center">
              <p>Лунные детали будут реализованы</p>
              <button 
                onClick={handleCloseDetails}
                className="mt-4 px-4 py-2 bg-emerald-600 rounded-lg"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
