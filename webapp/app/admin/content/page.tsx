"use client";

import { useState, useEffect } from 'react';
import { 
  PlusIcon, DocumentDuplicateIcon, SparklesIcon,
  EyeIcon, PencilIcon, TrashIcon
} from '@heroicons/react/24/outline';

interface ContentItem {
  id: string;
  type: string;
  title: string;
  sign: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
  effectiveDate: string;
  createdAt: string;
  author: string;
}

const contentTypes = [
  { id: 'DAILY_FORECAST', label: 'Ежедневный прогноз', color: 'bg-blue-600' },
  { id: 'DAILY_TIPS', label: 'Советы дня (сторис)', color: 'bg-emerald-600' },
  { id: 'SIGN_FORECAST', label: 'Прогноз по знаку', color: 'bg-purple-600' },
  { id: 'DOMAIN_FORECAST', label: 'Прогноз по сфере', color: 'bg-yellow-600' },
  { id: 'MOON_CALENDAR', label: 'Лунный календарь', color: 'bg-indigo-600' },
  { id: 'COMPATIBILITY', label: 'Совместимость', color: 'bg-pink-600' },
  { id: 'NATAL_CHART', label: 'Натальная карта', color: 'bg-red-600' },
  { id: 'PUSH', label: 'Push/Баннеры', color: 'bg-orange-600' },
  { id: 'UI_TEXT', label: 'UI-тексты', color: 'bg-gray-600' }
];

const zodiacSigns = [
  'ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO',
  'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'
];

const statuses = [
  { value: 'DRAFT', label: 'Черновик', color: 'bg-zinc-600' },
  { value: 'SCHEDULED', label: 'Запланировано', color: 'bg-yellow-600' },
  { value: 'PUBLISHED', label: 'Опубликовано', color: 'bg-emerald-600' },
  { value: 'ARCHIVED', label: 'Архив', color: 'bg-red-600' }
];

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [selectedSign, setSelectedSign] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [content, selectedType, selectedSign, selectedStatus, searchQuery]);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/content');
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || []);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = content;

    if (selectedType) {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    if (selectedSign) {
      filtered = filtered.filter(item => item.sign === selectedSign);
    }

    if (selectedStatus) {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredContent(filtered);
  };

  const handleCopyYesterday = async () => {
    try {
      const response = await fetch('/api/admin/content/utils/copy-yesterday', {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Скопировано ${data.count} записей`);
        loadContent();
      }
    } catch (error) {
      console.error('Error copying yesterday content:', error);
      alert('Ошибка при копировании');
    }
  };

  const handleGenerateToday = async () => {
    setShowGenerationModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = statuses.find(s => s.value === status);
    if (!statusInfo) return null;
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.color} text-white`}>
        {statusInfo.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeInfo = contentTypes.find(t => t.id === type);
    if (!typeInfo) return null;
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${typeInfo.color} text-white`}>
        {typeInfo.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
          <div className="h-64 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Управление контентом</h1>
          <p className="text-zinc-400">Создание, редактирование и публикация контента</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCopyYesterday}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
            <span>Копировать вчера</span>
          </button>
          <button
            onClick={handleGenerateToday}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Генерировать сегодня</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Добавить контент</span>
          </button>
        </div>
      </div>

      {/* Content Type Chips */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-4">Типы контента</h2>
        <div className="flex flex-wrap gap-2">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(selectedType === type.id ? '' : type.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === type.id
                  ? `${type.color} text-white`
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Поиск по заголовку или автору..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          
          <select
            value={selectedSign}
            onChange={(e) => setSelectedSign(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Все знаки</option>
            {zodiacSigns.map(sign => (
              <option key={sign} value={sign}>{sign}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Все статусы</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <div className="text-sm text-zinc-400 flex items-center justify-center">
            Найдено: {filteredContent.length}
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Контент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Знак
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Автор
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900 divide-y divide-zinc-800">
              {filteredContent.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{item.title}</div>
                      <div className="text-sm text-zinc-400">ID: {item.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(item.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-zinc-700 text-white rounded-full">
                      {item.sign}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {new Date(item.effectiveDate).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {item.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Content Status Widget */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-4">Состояние на сегодня</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {contentTypes.slice(0, 8).map((type) => {
            const typeContent = content.filter(item => item.type === type.id);
            const published = typeContent.filter(item => item.status === 'PUBLISHED').length;
            const total = typeContent.length;
            const status = total === 0 ? 'warning' : published === total ? 'ok' : 'error';
            
            return (
              <div key={type.id} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  status === 'ok' ? 'bg-emerald-600' :
                  status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  <span className="text-white text-sm font-medium">
                    {published}/{total}
                  </span>
                </div>
                <p className="text-sm text-white font-medium">{type.label}</p>
                <p className="text-xs text-zinc-400">
                  {status === 'ok' ? 'Готово' : status === 'warning' ? 'Нет данных' : 'Требует внимания'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals would go here */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Добавить контент</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-zinc-400">Модалка добавления контента будет реализована отдельно</p>
          </div>
        </div>
      )}

      {showGenerationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Генерация контента</h2>
              <button
                onClick={() => setShowGenerationModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-zinc-400">Модалка генерации контента будет реализована отдельно</p>
          </div>
        </div>
      )}
    </div>
  );
}
