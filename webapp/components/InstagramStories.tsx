"use client";

import { useState, useEffect, useRef } from 'react';

interface StorySlide {
  id: string;
  title: string;
  text: string;
  image?: string;
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

interface InstagramStoriesProps {
  stories: Story[];
}

export default function InstagramStories({ stories }: InstagramStoriesProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showStories, setShowStories] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentStory = stories[currentStoryIndex];
  const currentSlide = currentStory?.slides?.[currentSlideIndex];
  const allSlides = stories.flatMap(story => story.slides || []);
  const totalSlides = allSlides.length;

  useEffect(() => {
    if (isPlaying && showStories && currentSlide) {
      const duration = currentSlide.duration * 1000;
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            nextSlide();
            return 0;
          }
          return prev + (100 / (duration / 100));
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, showStories, currentStoryIndex, currentSlideIndex, currentSlide]);

  const nextSlide = () => {
    // Если есть еще слайды в текущей истории
    if (currentStory?.slides && currentSlideIndex < currentStory.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setProgress(0);
    }
    // Если это последний слайд текущей истории, переходим к следующей истории
    else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentSlideIndex(0);
      setProgress(0);
    }
    // Если это последняя история, закрываем
    else {
      closeStories();
    }
  };

  const prevSlide = () => {
    // Если это не первый слайд в текущей истории
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setProgress(0);
    }
    // Если это первый слайд, но не первая история
    else if (currentStoryIndex > 0) {
      const prevStory = stories[currentStoryIndex - 1];
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentSlideIndex((prevStory?.slides?.length || 1) - 1);
      setProgress(0);
    }
  };

  const openStories = () => {
    setShowStories(true);
    setIsPlaying(true);
    setCurrentStoryIndex(0);
    setCurrentSlideIndex(0);
    setProgress(0);
  };

  const closeStories = () => {
    setShowStories(false);
    setIsPlaying(false);
    setProgress(0);
    setCurrentStoryIndex(0);
    setCurrentSlideIndex(0);
  };

  const pauseStory = () => setIsPlaying(false);
  const resumeStory = () => setIsPlaying(true);

  if (stories.length === 0 || !currentStory) return null;

  return (
    <>
      {/* Stories Preview */}
      <div className="flex space-x-4 p-4 overflow-x-auto">
        <div className="flex-shrink-0">
          <button
            onClick={openStories}
            className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 p-0.5"
          >
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
          </button>
          <p className="text-xs text-center mt-2 text-zinc-400 w-16 truncate">
            Советы дня
          </p>
        </div>
      </div>

      {/* Stories Full Screen */}
      {showStories && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Progress Bars */}
          <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                  style={{ 
                    width: index < currentStoryIndex ? '100%' : 
                           index === currentStoryIndex ? `${progress}%` : '0%' 
                  }}
                />
              </div>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={closeStories}
            className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Story Content */}
          <div 
            className="relative w-full h-full flex items-center justify-center"
            style={{
              backgroundColor: currentSlide?.backgroundColor || '#1a1a2e',
              backgroundImage: currentSlide?.image ? `url(${currentSlide.image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onMouseDown={pauseStory}
            onMouseUp={resumeStory}
            onTouchStart={pauseStory}
            onTouchEnd={resumeStory}
          >
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
            
            {/* Story Text */}
            <div className="relative z-10 px-8 text-center max-w-sm">
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: currentSlide?.textColor || '#ffffff' }}
              >
                {currentSlide?.title}
              </h2>
              <p 
                className="text-lg leading-relaxed"
                style={{ color: currentSlide?.textColor || '#ffffff' }}
              >
                {currentSlide?.text}
              </p>
            </div>

            {/* Navigation Areas */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-0 w-1/3 h-full z-10"
              disabled={currentStoryIndex === 0 && currentSlideIndex === 0}
            />
            <button
              onClick={nextSlide}
              className="absolute right-0 top-0 w-1/3 h-full z-10"
            />

            {/* Pause/Play indicator */}
            {!isPlaying && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Story Info */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-sm">✨</span>
              </div>
              <div>
                <p className="font-medium text-sm">Elyse Astro</p>
                <p className="text-xs text-white/70">Советы дня</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
