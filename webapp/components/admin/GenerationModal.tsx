'use client';

import { useState } from 'react';
import { useToast } from '../ui/Toast';

interface ContentType {
  id: string;
  name: string;
  icon: string;
  type: string;
}

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: GenerationParams) => void;
}

interface GenerationParams {
  date: string;
  types: string[];
  signs: string[];
  domain?: string;
  house?: number;
  moonPhase?: string;
}

const CONTENT_TYPES = [
  { id: 'DAILY_FORECAST', name: 'Ежедневный прогноз', icon: '⭐' },
  { id: 'STORIES', name: 'Сторис', icon: '📱' },
  { id: 'SIGN_FORECAST', name: 'Прогноз по знаку', icon: '♈' },
  { id: 'MOON_CALENDAR', name: 'Лунный календарь', icon: '🌙' },
];

const ZODIAC_SIGNS = [
  'ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO',
  'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'
];

const DOMAINS = ['work', 'love', 'money', 'health', 'family', 'career'];
const HOUSES = Array.from({ length: 12 }, (_, i) => i + 1);

export function GenerationModal({ isOpen, onClose, onGenerate }: GenerationModalProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [params, setParams] = useState<GenerationParams>({
    date: new Date().toISOString().split('T')[0],
    types: ['DAILY_FORECAST'],
    signs: ZODIAC_SIGNS,
    domain: '',
    house: undefined,
    moonPhase: ''
  });

  const handleTypeToggle = (typeId: string) => {
    setParams(prev => ({
      ...prev,
      types: prev.types.includes(typeId)
        ? prev.types.filter(t => t !== typeId)
        : [...prev.types, typeId]
    }));
  };

  const handleSignToggle = (sign: string) => {
    setParams(prev => ({
      ...prev,
      signs: prev.signs.includes(sign)
        ? prev.signs.filter(s => s !== sign)
        : [...prev.signs, sign]
    }));
  };

  const handleSelectAllSigns = () => {
    setParams(prev => ({ ...prev, signs: ZODIAC_SIGNS }));
  };

  const handleClearAllSigns = () => {
    setParams(prev => ({ ...prev, signs: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (params.types.length === 0) {
      addToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Выберите хотя бы один тип контента'
      });
      return;
    }

    if (params.signs.length === 0) {
      addToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Выберите хотя бы один знак зодиака'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await onGenerate(params);
      onClose();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Ошибка генерации',
        message: error.message || 'Не удалось сгенерировать контент'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const estimatedCount = params.types.length * params.signs.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Генерация контента</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Дата генерации</label>
            <input
              type="date"
              value={params.date}
              onChange={(e) => setParams(prev => ({ ...prev, date: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>

          {/* Content Types */}
          <div>
            <label className="block text-sm font-medium mb-3">Типы контента для генерации</label>
            <div className="grid grid-cols-2 gap-3">
              {CONTENT_TYPES.map((type) => (
                <label key={type.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.types.includes(type.id)}
                    onChange={() => handleTypeToggle(type.id)}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm">{type.icon} {type.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Zodiac Signs */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium">Знаки зодиака</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllSigns}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                >
                  Все
                </button>
                <button
                  type="button"
                  onClick={handleClearAllSigns}
                  className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded"
                >
                  Очистить
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto bg-gray-800 p-3 rounded">
              {ZODIAC_SIGNS.map((sign) => (
                <label key={sign} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.signs.includes(sign)}
                    onChange={() => handleSignToggle(sign)}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="text-xs">{sign}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Сфера (опционально)</label>
              <select
                value={params.domain}
                onChange={(e) => setParams(prev => ({ ...prev, domain: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Не выбрано</option>
                {DOMAINS.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Дом (опционально)</label>
              <select
                value={params.house || ''}
                onChange={(e) => setParams(prev => ({ ...prev, house: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Не выбрано</option>
                {HOUSES.map(house => (
                  <option key={house} value={house}>{house}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Moon Phase */}
          <div>
            <label className="block text-sm font-medium mb-2">Фаза луны (опционально)</label>
            <input
              type="text"
              value={params.moonPhase}
              onChange={(e) => setParams(prev => ({ ...prev, moonPhase: e.target.value }))}
              placeholder="Например: Полнолуние, Новолуние"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {estimatedCount} элементов
              </div>
              <div className="text-sm text-gray-400">
                {params.types.length} типов × {params.signs.length} знаков
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg"
            >
              {isLoading ? 'Генерация...' : 'Генерировать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



