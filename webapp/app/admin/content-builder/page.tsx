"use client";

import { useState, useEffect } from 'react';
import { 
  WrenchScrewdriverIcon, SparklesIcon, EyeIcon,
  PlusIcon, TrashIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';

interface ContentTemplate {
  id: string;
  name: string;
  type: 'DAILY_TIP' | 'HOROSCOPE' | 'LUNAR' | 'FORECAST' | 'STORY';
  systemPrompt: string;
  userPrompt: string;
  parameters: Record<string, any>;
  examples: string[];
  isActive: boolean;
}

export default function ContentBuilderPage() {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    // Mock данные для демонстрации
    const mockTemplates: ContentTemplate[] = [
      {
        id: 'daily-tip-love',
        name: 'Совет дня: Любовь',
        type: 'DAILY_TIP',
        systemPrompt: 'Ты - мудрый астролог и духовный наставник. Создавай короткие, вдохновляющие советы о любви на русском языке. Стиль: мудрый, позитивный, практичный. Длина: 1-2 предложения, максимум 150 символов.',
        userPrompt: 'Создай совет дня о любви и отношениях для {{zodiac_sign}} на {{date}}',
        parameters: {
          zodiac_sign: 'Стрелец',
          date: new Date().toLocaleDateString('ru-RU')
        },
        examples: [
          'Сегодня звезды благоволят новым знакомствам. Откройте сердце для любви.',
          'Время укрепить существующие отношения. Проявите заботу к близким.'
        ],
        isActive: true
      },
      {
        id: 'horoscope-general',
        name: 'Общий гороскоп',
        type: 'HOROSCOPE',
        systemPrompt: 'Ты - профессиональный астролог. Создавай точные, персональные гороскопы на русском языке. Стиль: профессиональный, конкретный, полезный. Избегай общих фраз, давай конкретные советы.',
        userPrompt: 'Создай общий гороскоп для знака {{zodiac_sign}} на {{date}}. Учти транзиты планет и дай практические советы.',
        parameters: {
          zodiac_sign: 'Стрелец',
          date: new Date().toLocaleDateString('ru-RU')
        },
        examples: [
          'Сегодня Венера в вашем 7-м доме создает благоприятные аспекты для отношений...',
          'Марс в Весах указывает на потенциальные конфликты на работе. Оставайтесь спокойными...'
        ],
        isActive: true
      },
      {
        id: 'lunar-advice',
        name: 'Лунные советы',
        type: 'LUNAR',
        systemPrompt: 'Ты - эксперт по лунной астрологии. Создавай практические советы на основе лунных фаз и знаков. Стиль: мистический, но практичный. Длина: 2-3 предложения.',
        userPrompt: 'Дай совет для лунной фазы "{{moon_phase}}" в знаке {{moon_sign}}',
        parameters: {
          moon_phase: 'Растущая луна',
          moon_sign: 'Скорпион'
        },
        examples: [
          'Растущая луна в Скорпионе - время для глубинных трансформаций...',
          'Используйте эту энергию для избавления от старых привычек...'
        ],
        isActive: true
      }
    ];
    
    setTemplates(mockTemplates);
  };

  const handleTemplateSelect = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(false);
    setGeneratedContent('');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    
    // Здесь будет API вызов для сохранения
    console.log('Saving template:', selectedTemplate);
    
    // Обновляем в списке
    setTemplates(prev => 
      prev.map(t => t.id === selectedTemplate.id ? selectedTemplate : t)
    );
    
    setIsEditing(false);
    alert('Шаблон сохранен!');
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    try {
      // Заменяем параметры в промпте
      let prompt = selectedTemplate.userPrompt;
      Object.entries(selectedTemplate.parameters).forEach(([key, value]) => {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      });
      
      // Здесь будет вызов к AI API
      const response = await fetch('/api/admin/content/generate-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: selectedTemplate.systemPrompt,
          userPrompt: prompt,
          type: selectedTemplate.type
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setGeneratedContent(result.content || 'Пример сгенерированного контента для демонстрации...');
      } else {
        setGeneratedContent('Ошибка генерации. Проверьте настройки API.');
      }
    } catch (error) {
      setGeneratedContent('Ошибка соединения с AI сервисом.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      DAILY_TIP: 'bg-green-600',
      HOROSCOPE: 'bg-blue-600', 
      LUNAR: 'bg-purple-600',
      FORECAST: 'bg-orange-600',
      STORY: 'bg-pink-600'
    };
    return colors[type as keyof typeof colors] || 'bg-zinc-600';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      DAILY_TIP: 'Совет дня',
      HOROSCOPE: 'Гороскоп',
      LUNAR: 'Лунный',
      FORECAST: 'Прогноз', 
      STORY: 'История'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Конструктор контента</h1>
          <p className="text-zinc-400">Настройка промптов и параметров для генерации контента</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
          <PlusIcon className="w-4 h-4 mr-2" />
          Новый шаблон
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Шаблоны</h2>
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'bg-zinc-800 border-emerald-500'
                    : 'bg-zinc-900 border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{template.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${getTypeColor(template.type)} text-white`}>
                    {getTypeLabel(template.type)}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 truncate">
                  {template.systemPrompt.slice(0, 80)}...
                </p>
                <div className="flex items-center mt-2">
                  <div className={`w-2 h-2 rounded-full mr-2 ${template.isActive ? 'bg-green-400' : 'bg-zinc-600'}`} />
                  <span className="text-xs text-zinc-500">
                    {template.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTemplate ? (
            <>
              {/* Template Info */}
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">{selectedTemplate.name}</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEdit}
                      className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      <WrenchScrewdriverIcon className="w-4 h-4 mr-1" />
                      Редактировать
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-600 text-white text-sm rounded transition-colors"
                    >
                      <SparklesIcon className="w-4 h-4 mr-1" />
                      {isGenerating ? 'Генерирую...' : 'Генерировать'}
                    </button>
                  </div>
                </div>

                {/* System Prompt */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Системный промпт
                  </label>
                  {isEditing ? (
                    <textarea
                      value={selectedTemplate.systemPrompt}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        systemPrompt: e.target.value
                      })}
                      className="w-full h-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm resize-none"
                      placeholder="Инструкции для AI..."
                    />
                  ) : (
                    <div className="p-3 bg-zinc-800 rounded text-sm text-zinc-300">
                      {selectedTemplate.systemPrompt}
                    </div>
                  )}
                </div>

                {/* User Prompt */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Пользовательский промпт
                  </label>
                  {isEditing ? (
                    <textarea
                      value={selectedTemplate.userPrompt}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        userPrompt: e.target.value
                      })}
                      className="w-full h-20 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm resize-none"
                      placeholder="Запрос с параметрами {{parameter}}..."
                    />
                  ) : (
                    <div className="p-3 bg-zinc-800 rounded text-sm text-zinc-300">
                      {selectedTemplate.userPrompt}
                    </div>
                  )}
                </div>

                {/* Parameters */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Параметры
                  </label>
                  <div className="space-y-2">
                    {Object.entries(selectedTemplate.parameters).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-3">
                        <span className="text-sm text-zinc-400 w-24">{key}:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={String(value)}
                            onChange={(e) => setSelectedTemplate({
                              ...selectedTemplate,
                              parameters: {
                                ...selectedTemplate.parameters,
                                [key]: e.target.value
                              }
                            })}
                            className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                          />
                        ) : (
                          <span className="text-sm text-white">{String(value)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition-colors"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white text-sm rounded transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                )}
              </div>

              {/* Generated Content */}
              {generatedContent && (
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <EyeIcon className="w-5 h-5 mr-2" />
                    Сгенерированный контент
                  </h3>
                  <div className="p-4 bg-zinc-800 rounded border border-zinc-700">
                    <p className="text-white whitespace-pre-wrap">{generatedContent}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                      Использовать
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="px-3 py-2 bg-zinc-600 hover:bg-zinc-700 text-white text-sm rounded transition-colors"
                    >
                      Перегенерировать
                    </button>
                  </div>
                </div>
              )}

              {/* Examples */}
              <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <h3 className="text-lg font-semibold text-white mb-4">Примеры</h3>
                <div className="space-y-2">
                  {selectedTemplate.examples.map((example, index) => (
                    <div key={index} className="p-3 bg-zinc-800 rounded text-sm text-zinc-300">
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-zinc-900 rounded-lg p-12 border border-zinc-800 text-center">
              <DocumentTextIcon className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Выберите шаблон</h3>
              <p className="text-zinc-400">Выберите шаблон из списка слева для редактирования</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

