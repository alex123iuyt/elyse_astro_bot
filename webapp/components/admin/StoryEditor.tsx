"use client";

import { useState } from 'react';
import { 
  PlusIcon, TrashIcon, EyeIcon, 
  ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';

interface StorySlide {
  id: string;
  title: string;
  text: string;
  backgroundColor: string;
  textColor: string;
  duration: number;
  order: number;
}

interface Story {
  id: string;
  name: string;
  type: 'DAILY_TIP' | 'HOROSCOPE' | 'LUNAR' | 'INSPIRATION';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  slides: StorySlide[];
  publishedAt?: string;
  createdAt: string;
  views: number;
}

interface StoryEditorProps {
  story?: Story;
  isOpen: boolean;
  onClose: () => void;
  onSave: (story: Story) => void;
}

export default function StoryEditor({ story, isOpen, onClose, onSave }: StoryEditorProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [editingStory, setEditingStory] = useState<Story>(
    story || {
      id: '',
      name: '',
      type: 'DAILY_TIP',
      status: 'DRAFT',
      slides: [{
        id: '1',
        title: '',
        text: '',
        backgroundColor: '#8B5CF6',
        textColor: '#FFFFFF',
        duration: 5,
        order: 1
      }],
      createdAt: new Date().toISOString(),
      views: 0
    }
  );

  if (!isOpen) return null;

  const currentSlide = editingStory.slides[currentSlideIndex];

  const addSlide = () => {
    const newSlide: StorySlide = {
      id: Date.now().toString(),
      title: '',
      text: '',
      backgroundColor: '#8B5CF6',
      textColor: '#FFFFFF',
      duration: 5,
      order: editingStory.slides.length + 1
    };
    
    setEditingStory(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
    setCurrentSlideIndex(editingStory.slides.length);
  };

  const removeSlide = (index: number) => {
    if (editingStory.slides.length <= 1) return;
    
    setEditingStory(prev => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index)
    }));
    
    if (currentSlideIndex >= editingStory.slides.length - 1) {
      setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    }
  };

  const updateSlide = (field: keyof StorySlide, value: any) => {
    setEditingStory(prev => ({
      ...prev,
      slides: prev.slides.map((slide, i) => 
        i === currentSlideIndex ? { ...slide, [field]: value } : slide
      )
    }));
  };

  const updateStory = (field: keyof Story, value: any) => {
    setEditingStory(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editingStory.name.trim()) {
      alert('Введите название истории');
      return;
    }
    
    if (editingStory.slides.some(s => !s.title.trim() || !s.text.trim())) {
      alert('Заполните все слайды');
      return;
    }

    const storyToSave = {
      ...editingStory,
      id: editingStory.id || Date.now().toString()
    };
    
    onSave(storyToSave);
    onClose();
  };

  const nextSlide = () => {
    setCurrentSlideIndex(prev => 
      prev < editingStory.slides.length - 1 ? prev + 1 : prev
    );
  };

  const prevSlide = () => {
    setCurrentSlideIndex(prev => prev > 0 ? prev - 1 : prev);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">
            {story ? 'Редактировать историю' : 'Создать историю'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Story Settings */}
          <div className="w-80 border-r border-zinc-800 p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Название истории
              </label>
              <input
                type="text"
                value={editingStory.name}
                onChange={(e) => updateStory('name', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
                placeholder="Название для админки..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Тип
              </label>
              <select
                value={editingStory.type}
                onChange={(e) => updateStory('type', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
              >
                <option value="DAILY_TIP">Совет дня</option>
                <option value="HOROSCOPE">Гороскоп</option>
                <option value="LUNAR">Лунный</option>
                <option value="INSPIRATION">Вдохновение</option>
              </select>
            </div>

            {/* Slides Navigation */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-zinc-300">
                  Слайды ({editingStory.slides.length})
                </label>
                <button
                  onClick={addSlide}
                  className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {editingStory.slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      index === currentSlideIndex
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white font-medium">
                        Слайд {index + 1}
                      </span>
                      {editingStory.slides.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSlide(index);
                          }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 truncate mt-1">
                      {slide.title || 'Без названия'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Panel - Slide Editor */}
          <div className="flex-1 flex flex-col">
            {/* Slide Navigation */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevSlide}
                  disabled={currentSlideIndex === 0}
                  className="p-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:opacity-50 rounded transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4 text-white" />
                </button>
                <span className="text-sm text-zinc-300">
                  {currentSlideIndex + 1} / {editingStory.slides.length}
                </span>
                <button
                  onClick={nextSlide}
                  disabled={currentSlideIndex === editingStory.slides.length - 1}
                  className="p-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:opacity-50 rounded transition-colors"
                >
                  <ChevronRightIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Slide Content Editor */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Заголовок слайда
                  </label>
                  <input
                    type="text"
                    value={currentSlide?.title || ''}
                    onChange={(e) => updateSlide('title', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                    placeholder="Заголовок слайда..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Текст слайда
                  </label>
                  <textarea
                    value={currentSlide?.text || ''}
                    onChange={(e) => updateSlide('text', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white h-32 resize-none"
                    placeholder="Текст слайда..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Цвет фона
                    </label>
                    <input
                      type="color"
                      value={currentSlide?.backgroundColor || '#8B5CF6'}
                      onChange={(e) => updateSlide('backgroundColor', e.target.value)}
                      className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Цвет текста
                    </label>
                    <input
                      type="color"
                      value={currentSlide?.textColor || '#FFFFFF'}
                      onChange={(e) => updateSlide('textColor', e.target.value)}
                      className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Длительность (сек)
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="15"
                      value={currentSlide?.duration || 5}
                      onChange={(e) => updateSlide('duration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-80 border-l border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-zinc-300">Предварительный просмотр</h3>
            </div>
            
            <div className="space-y-3">
              <div 
                className="aspect-[9/16] rounded-lg flex items-center justify-center p-4 relative overflow-hidden"
                style={{ backgroundColor: currentSlide?.backgroundColor || '#8B5CF6' }}
              >
                <div className="text-center">
                  <h3 
                    className="font-bold text-lg mb-2"
                    style={{ color: currentSlide?.textColor || '#FFFFFF' }}
                  >
                    {currentSlide?.title || 'Заголовок'}
                  </h3>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: currentSlide?.textColor || '#FFFFFF' }}
                  >
                    {currentSlide?.text || 'Текст слайда...'}
                  </p>
                </div>
                
                {/* Duration indicator */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {currentSlide?.duration || 5}с
                </div>
              </div>
              
              {/* Slide thumbnails */}
              <div className="grid grid-cols-3 gap-2">
                {editingStory.slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`aspect-square rounded cursor-pointer border-2 transition-all ${
                      index === currentSlideIndex 
                        ? 'border-blue-500 ring-1 ring-blue-500' 
                        : 'border-zinc-600 hover:border-zinc-500'
                    }`}
                    style={{ backgroundColor: slide.backgroundColor }}
                  >
                    <div className="w-full h-full flex items-center justify-center p-1">
                      <span 
                        className="text-xs font-medium text-center truncate"
                        style={{ color: slide.textColor }}
                      >
                        {slide.title || `${index + 1}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800">
          <div className="text-sm text-zinc-400">
            {editingStory.slides.length} слайдов • Общая длительность: {editingStory.slides.reduce((acc, slide) => acc + slide.duration, 0)} сек
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

