'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

interface ContentData {
  dailyTips: ContentItem[];
  weeklyForecasts: ContentItem[];
  compatibilityTexts: ContentItem[];
  natalTexts: ContentItem[];
  onboardingTexts: ContentItem[];
  pushTemplates: ContentItem[];
}

export default function ContentTab() {
  const [content, setContent] = useState<ContentData>({
    dailyTips: [],
    weeklyForecasts: [],
    compatibilityTexts: [],
    natalTexts: [],
    onboardingTexts: [],
    pushTemplates: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof ContentData>('dailyTips');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch('/api/admin/content');
      const data = await response.json();
      
      if (data.success) {
        setContent(data.data);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentAction = async (action: string, contentType: string, data?: any) => {
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, contentType, data })
      });
      
      const result = await response.json();
      if (result.success) {
        await loadContent();
        if (action === 'delete') {
          setShowModal(false);
          setSelectedItem(null);
        }
      }
    } catch (error) {
      console.error('Error performing content action:', error);
    }
  };

  const categories = [
    { key: 'dailyTips', label: 'Ежедневные советы', icon: '⭐' },
    { key: 'weeklyForecasts', label: 'Недельные прогнозы', icon: '📅' },
    { key: 'compatibilityTexts', label: 'Совместимость', icon: '💕' },
    { key: 'natalTexts', label: 'Натальная карта', icon: '🔮' },
    { key: 'onboardingTexts', label: 'Онбординг', icon: '🚀' },
    { key: 'pushTemplates', label: 'Push-уведомления', icon: '📱' }
  ];

  const filteredContent = content[activeCategory]?.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление контентом</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setSelectedItem({
                id: '',
                title: '',
                content: '',
                category: activeCategory,
                isActive: true,
                createdAt: new Date().toISOString()
              });
              setShowModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            + Добавить контент
          </button>
          <a
            href="/admin/content"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            🚀 Расширенное управление
          </a>
        </div>
      </div>

      {/* Категории контента */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key as keyof ContentData)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeCategory === category.key
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'
                : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="text-sm font-medium">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Поиск */}
      <div className="relative">
        <input
          type="text"
          placeholder="Поиск по заголовку или содержимому..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
        />
        <span className="absolute right-3 top-3 text-zinc-400">🔍</span>
      </div>

      {/* Список контента */}
      <div className="grid gap-4">
        {filteredContent.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.isActive ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {item.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
                <p className="text-zinc-300 text-sm line-clamp-3">{item.content}</p>
                <div className="text-xs text-zinc-500 mt-2">
                  Создан: {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setShowModal(true);
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleContentAction('toggle', activeCategory, { id: item.id })}
                  className={`text-sm ${item.isActive ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}
                >
                  {item.isActive ? '👁️' : '✅'}
                </button>
                <button
                  onClick={() => handleContentAction('delete', activeCategory, { id: item.id })}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Модальное окно редактирования контента */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold mb-4">
              {selectedItem.id ? 'Редактировать контент' : 'Добавить контент'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Заголовок</label>
                <input
                  type="text"
                  value={selectedItem.title}
                  onChange={(e) => setSelectedItem({...selectedItem, title: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Содержимое</label>
                <textarea
                  value={selectedItem.content}
                  onChange={(e) => setSelectedItem({...selectedItem, content: e.target.value})}
                  rows={6}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Категория</label>
                <select
                  value={selectedItem.category}
                  onChange={(e) => setSelectedItem({...selectedItem, category: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedItem.isActive}
                    onChange={(e) => setSelectedItem({...selectedItem, isActive: e.target.checked})}
                    className="w-4 h-4 text-emerald-600 bg-zinc-800 border-zinc-700 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <span className="text-sm text-zinc-300">Активен</span>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  if (selectedItem.id) {
                    handleContentAction('update', activeCategory, selectedItem);
                  } else {
                    handleContentAction('add', activeCategory, selectedItem);
                  }
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl transition-colors"
              >
                {selectedItem.id ? 'Сохранить' : 'Добавить'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedItem(null);
                }}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-xl transition-colors"
              >
                Отмена
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}


