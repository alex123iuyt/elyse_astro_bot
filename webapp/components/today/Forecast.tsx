"use client";

import { useState } from 'react';
import { ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Transit {
  planet: string;
  sign: string;
  house: number;
  aspect: string;
}

interface FocusItem {
  category: string;
  description: string;
}

interface TroubleItem {
  category: string;
  description: string;
}

interface ForecastData {
  id: string;
  title: string;
  transitsCount: number;
  transits: Transit[];
  focus: FocusItem[];
  troubles: TroubleItem[];
  emotionalShifts: {
    title: string;
    description: string;
  };
  careerDynamics: {
    title: string;
    description: string;
  };
  publishedAt: string;
}

interface ForecastProps {
  forecast: ForecastData;
}

export default function Forecast({ forecast }: ForecastProps) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const handleOpenDetails = () => {
    setIsBottomSheetOpen(true);
  };

  const handleCloseDetails = () => {
    setIsBottomSheetOpen(false);
  };

  return (
    <>
      {/* Main Forecast Card */}
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <div className="text-sm text-zinc-400 mb-2">Прогноз</div>
        <h2 className="text-2xl font-bold text-white mb-4">{forecast.title}</h2>
        
        {/* Transits Info */}
        <div className="bg-zinc-800 rounded-full px-4 py-2 inline-flex items-center space-x-2 mb-6">
          <div className="flex space-x-1">
            <span className="text-lg">🪐</span>
            <span className="text-lg">🪐</span>
            <span className="text-lg">🪐</span>
          </div>
          <span className="text-white text-sm">Транзиты влияют: {forecast.transitsCount}</span>
        </div>

        {/* Focus and Troubles */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-emerald-400 font-semibold mb-3">Фокус</h3>
            <ul className="space-y-2">
              {forecast.focus.map((item, index) => (
                <li key={index} className="text-white text-sm">• {item.category}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-red-400 font-semibold mb-3">Проблемы</h3>
            <ul className="space-y-2">
              {forecast.troubles.map((item, index) => (
                <li key={index} className="text-white text-sm">• {item.category}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Emotional Shifts Preview */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-2">Эмоциональные изменения</h3>
          <p className="text-zinc-300 text-sm">
            {forecast.emotionalShifts.description.substring(0, 80)}...
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleOpenDetails}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition-colors font-medium"
        >
          Больше подробностей
        </button>
      </div>

      {/* Bottom Sheet */}
      {isBottomSheetOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-zinc-900 rounded-t-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-zinc-600 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-zinc-800">
              <h2 className="text-xl font-bold text-white">Подробный прогноз</h2>
              <button
                onClick={handleCloseDetails}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-6 py-4 space-y-6">
              {/* Transits */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Активные транзиты</h3>
                <div className="space-y-3">
                  {forecast.transits.map((transit, index) => (
                    <div key={index} className="bg-zinc-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-medium">{transit.planet}</span>
                        <span className="text-zinc-400 text-sm">{transit.aspect}</span>
                      </div>
                      <div className="text-white text-sm mt-1">
                        {transit.sign} • Дом {transit.house}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Focus Details */}
              <div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-3">Области фокуса</h3>
                <div className="space-y-3">
                  {forecast.focus.map((item, index) => (
                    <div key={index} className="bg-zinc-800 rounded-lg p-3">
                      <h4 className="text-white font-medium mb-1">{item.category}</h4>
                      <p className="text-zinc-300 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Troubles Details */}
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-3">Вызовы</h3>
                <div className="space-y-3">
                  {forecast.troubles.map((item, index) => (
                    <div key={index} className="bg-zinc-800 rounded-lg p-3">
                      <h4 className="text-white font-medium mb-1">{item.category}</h4>
                      <p className="text-zinc-300 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emotional Shifts Full */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{forecast.emotionalShifts.title}</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {forecast.emotionalShifts.description}
                </p>
              </div>

              {/* Career Dynamics Full */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{forecast.careerDynamics.title}</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {forecast.careerDynamics.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

