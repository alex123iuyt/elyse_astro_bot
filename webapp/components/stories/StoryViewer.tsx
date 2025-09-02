'use client';

import { useState, useEffect, useRef } from 'react';

interface StoryStep {
  id: string;
  type: 'text' | 'image' | 'quote' | 'cta';
  content: string;
  durationMs?: number;
}

interface Story {
  id: string;
  title?: string;
  steps: StoryStep[];
  effectiveDate: string;
  sign: string;
}

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
}

export function StoryViewer({ story, onClose }: StoryViewerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const stepStartTimeRef = useRef<number>(Date.now());

  const currentStep = story.steps[currentStepIndex];
  const progress = story.steps.length > 0 ? ((currentStepIndex + 1) / story.steps.length) * 100 : 0;

  // Auto-advance to next step
  useEffect(() => {
    if (isPaused || !currentStep) return;

    const duration = currentStep.durationMs || 5000;
    const elapsed = Date.now() - stepStartTimeRef.current;
    const remaining = Math.max(0, duration - elapsed);

    progressIntervalRef.current = setTimeout(() => {
      if (currentStepIndex < story.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        stepStartTimeRef.current = Date.now();
      } else {
        // Story finished
        onClose();
      }
    }, remaining);

    return () => {
      if (progressIntervalRef.current) {
        clearTimeout(progressIntervalRef.current);
      }
    };
  }, [currentStepIndex, currentStep, story.steps.length, isPaused, onClose]);

  // Reset timer when step changes
  useEffect(() => {
    stepStartTimeRef.current = Date.now();
  }, [currentStepIndex]);

  const handleStepClick = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentStepIndex < story.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        handleStepClick('next');
        break;
      case 'ArrowLeft':
        handleStepClick('prev');
        break;
      case 'Escape':
        onClose();
        break;
      case 'p':
      case 'P':
        handlePause();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex]);

  if (!currentStep) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
        <div 
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-white text-sm font-medium">{story.sign}</span>
          {story.title && (
            <span className="text-white/80 text-sm">{story.title}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePause}
            className="text-white/80 hover:text-white p-2"
            title={isPaused ? 'Продолжить (P)' : 'Пауза (P)'}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2"
            title="Закрыть (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Step Counter */}
      <div className="absolute top-16 left-4 text-white/60 text-sm">
        {currentStepIndex + 1} / {story.steps.length}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          {/* Step Type Indicator */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
              {getStepTypeLabel(currentStep.type)}
            </span>
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {currentStep.type === 'image' ? (
              <img 
                src={currentStep.content} 
                alt="Story image"
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="text-white text-lg leading-relaxed">
                {currentStep.content}
              </div>
            )}
          </div>

          {/* CTA Button for CTA type */}
          {currentStep.type === 'cta' && (
            <button className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Действовать
            </button>
          )}
        </div>
      </div>

      {/* Navigation Hints */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-sm text-center">
        <div className="mb-2">
          <span className="mr-4">← Предыдущий</span>
          <span>Следующий →</span>
        </div>
        <div className="text-xs">
          Используйте стрелки, пробел для навигации, P для паузы, Esc для закрытия
        </div>
      </div>

      {/* Touch Areas for Mobile */}
      <div className="absolute inset-0 flex">
        {/* Left half - previous */}
        <div 
          className="w-1/2 h-full cursor-pointer"
          onClick={() => handleStepClick('prev')}
        />
        {/* Right half - next */}
        <div 
          className="w-1/2 h-full cursor-pointer"
          onClick={() => handleStepClick('next')}
        />
      </div>
    </div>
  );
}

function getStepTypeLabel(type: string): string {
  switch (type) {
    case 'text': return '📝 Текст';
    case 'image': return '🖼️ Изображение';
    case 'quote': return '💬 Цитата';
    case 'cta': return '🎯 Призыв к действию';
    default: return type;
  }
}






