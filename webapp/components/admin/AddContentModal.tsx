'use client';

import { useState, useEffect } from 'react';
import { useToast } from '../ui/Toast';
import { StoryPreview } from './StoryPreview';

interface ContentType {
  id: string;
  name: string;
  icon: string;
  type: string;
}

interface StoryStep {
  id: string;
  type: 'text' | 'image' | 'quote' | 'cta';
  content: string;
  durationMs?: number;
}

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType;
  onSuccess: () => void;
}

const ZODIAC_SIGNS = [
  'ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO',
  'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES'
];

const DOMAINS = ['work', 'love', 'money', 'health', 'family', 'career'];
const HOUSES = Array.from({ length: 12 }, (_, i) => i + 1);

export function AddContentModal({ isOpen, onClose, contentType, onSuccess }: AddContentModalProps) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    tags: [] as string[],
    status: 'DRAFT',
    visibility: 'PUBLIC',
    locale: 'ru',
    sign: '',
    signB: '',
    dateFrom: '',
    dateTo: '',
    effectiveDate: '',
    domain: '',
    house: '',
    moonPhase: '',
    body: null as any,
    meta: {} as Record<string, any>
  });
  const [storySteps, setStorySteps] = useState<StoryStep[]>([]);
  const [newStep, setNewStep] = useState<Partial<StoryStep>>({
    type: 'text',
    content: '',
    durationMs: 5000
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setFormData({
        title: '',
        summary: '',
        tags: [],
        status: 'DRAFT',
        visibility: 'PUBLIC',
        locale: 'ru',
        sign: '',
        signB: '',
        dateFrom: '',
        dateTo: '',
        effectiveDate: '',
        domain: '',
        house: '',
        moonPhase: '',
        body: null,
        meta: {}
      });
      setStorySteps([]);
      setNewStep({ type: 'text', content: '', durationMs: 5000 });
    }
  }, [isOpen, contentType]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMetaChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      meta: { ...prev.meta, [key]: value }
    }));
  };

  const addStoryStep = () => {
    if (!newStep.content || !newStep.type) return;
    
    const step: StoryStep = {
      id: Math.random().toString(36).substr(2, 9),
      type: newStep.type as 'text' | 'image' | 'quote' | 'cta',
      content: newStep.content,
      durationMs: newStep.durationMs || 5000
    };
    
    setStorySteps(prev => [...prev, step]);
    setNewStep({ type: 'text', content: '', durationMs: 5000 });
  };

  const removeStoryStep = (id: string) => {
    setStorySteps(prev => prev.filter(step => step.id !== id));
  };

  const moveStoryStep = (id: string, direction: 'up' | 'down') => {
    setStorySteps(prev => {
      const index = prev.findIndex(step => step.id === id);
      if (index === -1) return prev;
      
      const newSteps = [...prev];
      if (direction === 'up' && index > 0) {
        [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
      } else if (direction === 'down' && index < newSteps.length - 1) {
        [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      }
      
      return newSteps;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare body based on content type
      let body = formData.body;
      if (contentType.type === 'STORIES') {
        body = storySteps;
      }

      // Prepare meta data
      const meta: Record<string, any> = { ...formData.meta };
      if (formData.domain) meta.domain = formData.domain;
      if (formData.house) meta.house = parseInt(formData.house);
      if (formData.moonPhase) meta.moonPhase = formData.moonPhase;
      if (contentType.type === 'COMPATIBILITY' && formData.signB) {
        meta.signA = formData.sign;
        meta.signB = formData.signB;
      }

      const payload = {
        type: contentType.type,
        title: formData.title,
        summary: formData.summary,
        tags: formData.tags,
        status: formData.status,
        visibility: formData.visibility,
        locale: formData.locale,
        sign: formData.sign || null,
        signB: formData.signB || null,
        dateFrom: formData.dateFrom || null,
        dateTo: formData.dateTo || null,
        effectiveDate: formData.effectiveDate || null,
        body,
        meta
      };

      const response = await fetch(`/api/admin/content/${contentType.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Контент создан',
          message: `Успешно создан ${contentType.name}`
        });
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка при создании контента');
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Ошибка',
        message: error.message || 'Не удалось создать контент'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Добавить {contentType.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Заголовок *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Статус</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="DRAFT">Черновик</option>
                <option value="SCHEDULED">Запланировано</option>
                <option value="PUBLISHED">Опубликовано</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Описание</label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white h-20"
            />
          </div>

          {/* Zodiac Sign Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Знак зодиака</label>
              <select
                value={formData.sign}
                onChange={(e) => handleInputChange('sign', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Выберите знак</option>
                {ZODIAC_SIGNS.map(sign => (
                  <option key={sign} value={sign}>{sign}</option>
                ))}
              </select>
            </div>

            {contentType.type === 'COMPATIBILITY' && (
              <div>
                <label className="block text-sm font-medium mb-2">Второй знак</label>
                <select
                  value={formData.signB}
                  onChange={(e) => handleInputChange('signB', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Выберите знак</option>
                  {ZODIAC_SIGNS.map(sign => (
                    <option key={sign} value={sign}>{sign}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Дата начала</label>
              <input
                type="date"
                value={formData.dateFrom}
                onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Дата окончания</label>
              <input
                type="date"
                value={formData.dateTo}
                onChange={(e) => handleInputChange('dateTo', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Эффективная дата</label>
              <input
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Domain and House Fields */}
          {(contentType.type === 'DOMAIN_FORECAST' || contentType.type === 'SIGN_FORECAST') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Сфера</label>
                <select
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Выберите сферу</option>
                  {DOMAINS.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Дом</label>
                <select
                  value={formData.house}
                  onChange={(e) => handleInputChange('house', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Выберите дом</option>
                  {HOUSES.map(house => (
                    <option key={house} value={house}>{house}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Moon Phase Field */}
          {contentType.type === 'MOON_CALENDAR' && (
            <div>
              <label className="block text-sm font-medium mb-2">Фаза луны</label>
              <input
                type="text"
                value={formData.moonPhase}
                onChange={(e) => handleInputChange('moonPhase', e.target.value)}
                placeholder="Например: Полнолуние, Новолуние, Растущая, Убывающая"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          )}

          {/* Story Steps for Stories Type */}
          {contentType.type === 'STORIES' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium">Шаги истории</label>
                {storySteps.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    👁️ Предварительный просмотр
                  </button>
                )}
              </div>
              
              {/* Add New Step */}
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-4 gap-3">
                  <select
                    value={newStep.type}
                    onChange={(e) => setNewStep(prev => ({ ...prev, type: e.target.value as any }))}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="text">Текст</option>
                    <option value="image">Изображение</option>
                    <option value="quote">Цитата</option>
                    <option value="cta">Призыв к действию</option>
                  </select>
                  
                  <input
                    type="text"
                    value={newStep.content}
                    onChange={(e) => setNewStep(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Содержание шага"
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white col-span-2"
                  />
                  
                  <input
                    type="number"
                    value={newStep.durationMs}
                    onChange={(e) => setNewStep(prev => ({ ...prev, durationMs: parseInt(e.target.value) }))}
                    placeholder="Длительность (мс)"
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={addStoryStep}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  ➕ Добавить шаг
                </button>
              </div>

              {/* Existing Steps */}
              <div className="space-y-2">
                {storySteps.map((step, index) => (
                  <div key={step.id} className="bg-gray-800 p-3 rounded-lg flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-8">{index + 1}</span>
                    <span className="text-sm bg-gray-700 px-2 py-1 rounded">{step.type}</span>
                    <span className="flex-1 text-sm">{step.content}</span>
                    <span className="text-sm text-gray-400">{step.durationMs}мс</span>
                    
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveStoryStep(step.id, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-white disabled:opacity-50"
                      >
                        ⬆️
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStoryStep(step.id, 'down')}
                        disabled={index === storySteps.length - 1}
                        className="text-gray-400 hover:text-white disabled:opacity-50"
                      >
                        ⬇️
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStoryStep(step.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Теги</label>
            <input
              type="text"
              placeholder="Введите теги через запятую"
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                handleInputChange('tags', tags);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
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
              {isLoading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>

      {/* Story Preview Modal */}
      {contentType.type === 'STORIES' && showPreview && (
        <StoryPreview
          steps={storySteps}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
