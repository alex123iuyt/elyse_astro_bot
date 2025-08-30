"use client";
import { useState, useEffect } from 'react';

export interface Story {
  id: string;
  title: string;
  image: string;
  text: string;
}

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  stories?: Story[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

export default function StoryViewer({ 
  story, 
  onClose, 
  stories = [], 
  currentIndex = 0,
  onNavigate 
}: StoryViewerProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Минимальное расстояние для свайпа
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onNavigate && currentIndex < stories.length - 1) {
      // Свайп влево - следующая история
      onNavigate(currentIndex + 1);
    } else if (isRightSwipe && onNavigate && currentIndex > 0) {
      // Свайп вправо - предыдущая история
      onNavigate(currentIndex - 1);
    }
  };

  // Обработка клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && onNavigate && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && onNavigate && currentIndex < stories.length - 1) {
        onNavigate(currentIndex + 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, stories.length, onNavigate, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div 
        className="relative w-full h-full max-w-md max-h-[80vh] bg-zinc-900 rounded-2xl overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{story.title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={story.image}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-16rem)]">
          <div className="prose prose-invert max-w-none">
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {story.text}
            </p>
          </div>
        </div>

        {/* Navigation indicators */}
        {stories.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {stories.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-emerald-400' : 'bg-zinc-600'
                }`}
              />
            ))}
          </div>
        )}

        {/* Swipe hints */}
        {stories.length > 1 && (
          <div className="absolute inset-0 pointer-events-none">
            {currentIndex > 0 && (
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/30 text-sm">
                ← Предыдущая
              </div>
            )}
            {currentIndex < stories.length - 1 && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/30 text-sm">
                Следующая →
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
