"use client";

import { useState, useEffect } from 'react';
import { 
  PlusIcon, EyeIcon, PencilIcon, TrashIcon,
  PlayIcon, PauseIcon, PhotoIcon
} from '@heroicons/react/24/outline';
import StoryEditor from '../../../components/admin/StoryEditor';

// Компонент для предварительного просмотра истории
function StoryPreviewModal({ story, onClose }: { story: Story, onClose: () => void }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const currentSlide = story.slides[currentSlideIndex];

  useEffect(() => {
    if (!isPlaying || !currentSlide) return;

    const duration = currentSlide.duration * 1000;
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 100));
        if (newProgress >= 100) {
          if (currentSlideIndex < story.slides.length - 1) {
            setCurrentSlideIndex(prev => prev + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentSlideIndex, isPlaying, currentSlide, story.slides.length, onClose]);

  const nextSlide = () => {
    if (currentSlideIndex < story.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  if (!currentSlide) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {story.slides.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
              style={{ 
                width: index < currentSlideIndex ? '100%' : 
                       index === currentSlideIndex ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Story content */}
      <div 
        className="w-full h-full flex items-center justify-center p-8"
        style={{ backgroundColor: currentSlide.backgroundColor }}
        onMouseDown={() => setIsPlaying(false)}
        onMouseUp={() => setIsPlaying(true)}
        onTouchStart={() => setIsPlaying(false)}
        onTouchEnd={() => setIsPlaying(true)}
      >
        <div className="text-center max-w-sm">
          <h2 
            className="text-2xl font-bold mb-4"
            style={{ color: currentSlide.textColor }}
          >
            {currentSlide.title}
          </h2>
          <p 
            className="text-lg leading-relaxed"
            style={{ color: currentSlide.textColor }}
          >
            {currentSlide.text}
          </p>
        </div>
      </div>

      {/* Navigation areas */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-0 w-1/3 h-full z-10"
        disabled={currentSlideIndex === 0}
      />
      <button
        onClick={nextSlide}
        className="absolute right-0 top-0 w-1/3 h-full z-10"
      />

      {/* Play/Pause indicator */}
      {!isPlaying && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Story info */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="flex items-center justify-between text-white text-sm">
          <span>{story.name}</span>
          <span>{currentSlideIndex + 1} / {story.slides.length}</span>
        </div>
      </div>
    </div>
  );
}

interface StorySlide {
  id: string;
  title: string;
  text: string;
  image?: string;
  backgroundColor: string;
  textColor: string;
  duration: number; // в секундах
  order: number;
}

interface Story {
  id: string;
  name: string; // название истории для админки
  type: 'DAILY_TIP' | 'HOROSCOPE' | 'LUNAR' | 'INSPIRATION';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  slides: StorySlide[];
  publishedAt?: string;
  createdAt: string;
  views: number;
}



export default function StoriesAdminPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [previewStory, setPreviewStory] = useState<Story | null>(null);


  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setIsLoading(true);
      
      // Mock данные для демонстрации
      const mockStories: Story[] = [
        {
          id: '1',
          name: 'Совет дня о любви',
          type: 'DAILY_TIP',
          status: 'PUBLISHED',
          slides: [
            {
              id: '1-1',
              title: 'Совет дня о любви',
              text: 'Сегодня звезды благоволят новым знакомствам. Откройте сердце для любви.',
              backgroundColor: '#8B5CF6',
              textColor: '#FFFFFF',
              duration: 5,
              order: 1
            },
            {
              id: '1-2',
              title: 'Первый шаг',
              text: 'Не бойтесь делать первый шаг. Венера в вашем доме отношений поддержит вас.',
              backgroundColor: '#9333EA',
              textColor: '#FFFFFF',
              duration: 5,
              order: 2
            },
            {
              id: '1-3',
              title: 'Энергия любви',
              text: 'Излучайте любовь, и она обязательно к вам вернется. Будьте открыты новому.',
              backgroundColor: '#7C3AED',
              textColor: '#FFFFFF',
              duration: 5,
              order: 3
            }
          ],
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          views: 1247
        },
        {
          id: '2',
          name: 'Лунная энергия',
          type: 'LUNAR',
          status: 'PUBLISHED',
          slides: [
            {
              id: '2-1',
              title: 'Растущая Луна',
              text: 'Растущая Луна в Скорпионе - время для глубинных трансформаций.',
              backgroundColor: '#7C3AED',
              textColor: '#FFFFFF',
              duration: 6,
              order: 1
            },
            {
              id: '2-2',
              title: 'Время перемен',
              text: 'Используйте эту энергию для избавления от старых привычек и паттернов.',
              backgroundColor: '#6D28D9',
              textColor: '#FFFFFF',
              duration: 6,
              order: 2
            }
          ],
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          views: 892
        },
        {
          id: '3',
          name: 'Черновик истории',
          type: 'INSPIRATION',
          status: 'DRAFT',
          slides: [
            {
              id: '3-1',
              title: 'Черновик',
              text: 'Это черновик истории, который еще не опубликован.',
              backgroundColor: '#EC4899',
              textColor: '#FFFFFF',
              duration: 5,
              order: 1
            }
          ],
          createdAt: new Date().toISOString(),
          views: 0
        }
      ];
      
      setStories(mockStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStory = (story: Story) => {
    if (editingStory) {
      // Обновляем существующую историю
      setStories(prev => prev.map(s => s.id === story.id ? story : s));
      alert('История обновлена!');
    } else {
      // Создаем новую историю
      const newStory = {
        ...story,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        views: 0
      };
      setStories(prev => [newStory, ...prev]);
      alert('История создана!');
    }
    setEditingStory(null);
  };

  const handlePublishStory = async (storyId: string) => {
    try {
      // Здесь будет API вызов для публикации
      setStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { ...story, status: 'PUBLISHED' as const, publishedAt: new Date().toISOString() }
            : story
        )
      );
      alert('История опубликована!');
    } catch (error) {
      console.error('Error publishing story:', error);
      alert('Ошибка при публикации');
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Удалить историю?')) return;
    
    try {
      setStories(prev => prev.filter(story => story.id !== storyId));
      alert('История удалена!');
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Ошибка при удалении');
    }
  };



  const getTypeLabel = (type: string) => {
    const labels = {
      DAILY_TIP: 'Совет дня',
      HOROSCOPE: 'Гороскоп',
      LUNAR: 'Лунный',
      INSPIRATION: 'Вдохновение'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      DAILY_TIP: 'bg-green-600',
      HOROSCOPE: 'bg-blue-600',
      LUNAR: 'bg-purple-600',
      INSPIRATION: 'bg-orange-600'
    };
    return colors[type as keyof typeof colors] || 'bg-zinc-600';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PUBLISHED: 'bg-emerald-600',
      DRAFT: 'bg-yellow-600',
      ARCHIVED: 'bg-zinc-600'
    };
    return colors[status as keyof typeof colors] || 'bg-zinc-600';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PUBLISHED: 'Опубликовано',
      DRAFT: 'Черновик',
      ARCHIVED: 'Архив'
    };
    return labels[status as keyof typeof labels] || status;
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
          <h1 className="text-2xl font-bold text-white">Управление сторисами</h1>
          <p className="text-zinc-400">Создание и редактирование историй для пользователей</p>
        </div>
        <button
          onClick={() => {
            setEditingStory(null);
            setShowEditor(true);
          }}
          className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Создать историю
        </button>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stories.map((story) => (
          <div key={story.id} className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
            {/* Story Preview - показываем первый слайд */}
            <div 
              className="h-64 flex items-center justify-center p-4 relative"
              style={{ backgroundColor: story.slides[0]?.backgroundColor || '#8B5CF6' }}
            >
              <div className="text-center">
                <h3 
                  className="font-bold text-lg mb-2"
                  style={{ color: story.slides[0]?.textColor || '#FFFFFF' }}
                >
                  {story.slides[0]?.title || 'Без названия'}
                </h3>
                <p 
                  className="text-sm line-clamp-4"
                  style={{ color: story.slides[0]?.textColor || '#FFFFFF' }}
                >
                  {story.slides[0]?.text || 'Нет текста'}
                </p>
              </div>
              
              {/* Индикатор количества слайдов */}
              {story.slides.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {story.slides.length} слайдов
                </div>
              )}
            </div>

            {/* Story Info */}
            <div className="p-4">
              <h4 className="font-semibold text-white mb-2 truncate">{story.name}</h4>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs rounded ${getTypeColor(story.type)} text-white`}>
                    {getTypeLabel(story.type)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(story.status)} text-white`}>
                    {getStatusLabel(story.status)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-zinc-400 mb-4">
                <span>👁️ {story.views} просмотров</span>
                <span>{new Date(story.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setPreviewStory(story)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center justify-center"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  Просмотр
                </button>
                
                {story.status === 'DRAFT' && (
                  <button
                    onClick={() => handlePublishStory(story.id)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition-colors"
                  >
                    <PlayIcon className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setEditingStory(story);
                    setShowEditor(true);
                  }}
                  className="px-3 py-2 bg-zinc-600 hover:bg-zinc-700 text-white text-sm rounded transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDeleteStory(story.id)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Story Editor */}
      <StoryEditor
        story={editingStory || undefined}
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingStory(null);
        }}
        onSave={handleSaveStory}
      />

      {/* Preview Modal */}
      {previewStory && (
        <StoryPreviewModal 
          story={previewStory} 
          onClose={() => setPreviewStory(null)} 
        />
      )}
    </div>
  );
}
