"use client";

import { useState, useEffect } from 'react';
import InstagramStories from './InstagramStories';

interface Story {
  id: string;
  title: string;
  text: string;
  image?: string;
  backgroundColor?: string;
  textColor?: string;
  type: 'DAILY_TIP' | 'HOROSCOPE' | 'LUNAR' | 'INSPIRATION';
  createdAt: string;
}

export default function StoriesSection() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setIsLoading(true);
      
      // Пока используем mock данные
      const mockStories: Story[] = [
        {
          id: '1',
          title: 'Совет дня',
          text: 'Сегодня звезды благоволят новым знакомствам. Откройте сердце для любви и не бойтесь делать первый шаг.',
          backgroundColor: '#8B5CF6',
          textColor: '#FFFFFF',
          type: 'DAILY_TIP',
          createdAt: new Date().toISOString()
        },
        {
          id: '2', 
          title: 'Лунный календарь',
          text: 'Растущая Луна в Скорпионе - время для глубинных трансформаций. Используйте эту энергию для избавления от старых привычек.',
          backgroundColor: '#7C3AED',
          textColor: '#FFFFFF',
          type: 'LUNAR',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Гороскоп',
          text: 'Стрельцам сегодня стоит обратить внимание на финансовые возможности. Венера в вашем 2-м доме создает благоприятные аспекты.',
          backgroundColor: '#EC4899',
          textColor: '#FFFFFF', 
          type: 'HOROSCOPE',
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          title: 'Вдохновение',
          text: 'Каждый день - это новая возможность стать лучше. Позвольте звездам направлять ваш путь к счастью и гармонии.',
          backgroundColor: '#F59E0B',
          textColor: '#FFFFFF',
          type: 'INSPIRATION', 
          createdAt: new Date().toISOString()
        }
      ];
      
      setStories(mockStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex space-x-4 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0">
              <div className="w-16 h-16 bg-zinc-800 rounded-full animate-pulse"></div>
              <div className="w-16 h-3 bg-zinc-800 rounded mt-2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  // Convert simple stories to stories with slides format
  const storiesWithSlides = stories.map(story => ({
    id: story.id,
    name: story.title,
    type: story.type,
    status: 'PUBLISHED' as const,
    slides: [{
      id: `${story.id}-slide-1`,
      title: story.title,
      text: story.text,
      image: story.image,
      backgroundColor: story.backgroundColor || '#8B5CF6',
      textColor: story.textColor || '#FFFFFF',
      duration: 5, // 5 seconds per slide
      order: 1
    }],
    publishedAt: story.createdAt,
    createdAt: story.createdAt,
    views: 0
  }));

  return (
    <div className="mb-6">
      <InstagramStories stories={storiesWithSlides} />
    </div>
  );
}

