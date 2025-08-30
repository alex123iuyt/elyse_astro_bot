"use client";

import { useState } from 'react';

interface StorySlide {
  id: string;
  kind: 'text' | 'image' | 'video';
  title?: string;
  text?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  durationMs: number;
}

interface Story {
  id: string;
  type: 'DAILY_TIPS' | 'DO_DONT' | 'TODAYS_LUCK';
  title: string;
  category: string;
  slides: StorySlide[];
  publishedAt: string;
}

interface StoriesProps {
  stories: Story[];
}

export default function Stories({ stories }: StoriesProps) {
  const [openStoryIndex, setOpenStoryIndex] = useState<number | null>(null);

  if (stories.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-bold text-white">Ежедневные советы</div>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2">
        {stories.map((story, index) => (
          <button 
            key={story.id} 
            onClick={() => setOpenStoryIndex(index)}
            className="min-w-48 aspect-[4/3] rounded-2xl overflow-hidden relative border-2 border-emerald-400/30 hover:border-emerald-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
          >
            {/* Background Image */}
            {story.slides[0]?.backgroundImage ? (
              <img 
                src={story.slides[0].backgroundImage} 
                alt={story.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full"
                style={{ backgroundColor: story.slides[0]?.backgroundColor || '#1a1a2e' }}
              />
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <div className="text-white font-bold text-base mb-1">{story.title}</div>
              <div className="text-emerald-300 text-sm font-medium">{story.category}</div>
              {story.slides[0]?.text && (
                <div className="text-gray-200 text-xs mt-1 line-clamp-2">
                  {story.slides[0].text}
                </div>
              )}
            </div>
            
            {/* Play indicator */}
            <div className="absolute top-3 right-3 w-8 h-8 bg-emerald-500/80 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">▶</span>
            </div>
          </button>
        ))}
      </div>

      {/* Fullscreen Story Viewer - будет добавлен позже */}
      {openStoryIndex !== null && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-white text-center">
            <p>Story viewer будет реализован</p>
            <button 
              onClick={() => setOpenStoryIndex(null)}
              className="mt-4 px-4 py-2 bg-emerald-600 rounded-lg"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
