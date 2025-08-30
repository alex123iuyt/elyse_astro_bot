'use client';

import { useState } from 'react';

interface StoryStep {
  id: string;
  type: 'text' | 'image' | 'quote' | 'cta';
  content: string;
  durationMs?: number;
}

interface StoryPreviewProps {
  steps: StoryStep[];
  onClose: () => void;
}

export function StoryPreview({ steps, onClose }: StoryPreviewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentStep = steps[currentStepIndex];
  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleClose = () => {
    onClose();
  };

  if (steps.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-2">Предварительный просмотр</h3>
            <p className="text-gray-400 mb-6">Добавьте шаги истории для предварительного просмотра</p>
            <button
              onClick={handleClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
        <div 
          className="h-full bg-green-500 transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-white text-sm font-medium bg-green-600 px-3 py-1 rounded-full">
            Превью
          </span>
          <span className="text-white/80 text-sm">
            Шаг {currentStepIndex + 1} из {steps.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayPause}
            className="text-white/80 hover:text-white p-2"
            title={isPlaying ? 'Пауза' : 'Воспроизвести'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white p-2"
            title="Закрыть"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          {/* Step Type Badge */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium">
              {getStepTypeLabel(currentStep.type)}
            </span>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {currentStep.type === 'image' ? (
              <div className="bg-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-600">
                <div className="text-gray-400 text-sm mb-2">Изображение</div>
                <div className="text-gray-500 text-xs break-all">{currentStep.content}</div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
                <div className="text-white text-lg leading-relaxed">
                  {currentStep.content}
                </div>
              </div>
            )}
          </div>

          {/* Duration Info */}
          <div className="text-gray-400 text-sm mb-6">
            Длительность: {currentStep.durationMs || 5000}мс
          </div>

          {/* CTA Button Preview */}
          {currentStep.type === 'cta' && (
            <div className="mb-6">
              <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Действовать
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors"
          title="Предыдущий шаг"
        >
          ⬅️
        </button>
        
        <div className="bg-gray-800 px-4 py-2 rounded-full">
          <span className="text-white text-sm">
            {currentStepIndex + 1} / {steps.length}
          </span>
        </div>
        
        <button
          onClick={handleNext}
          disabled={currentStepIndex === steps.length - 1}
          className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors"
          title="Следующий шаг"
        >
          ➡️
        </button>
      </div>

      {/* Step List */}
      <div className="absolute bottom-8 right-4">
        <div className="bg-gray-800 rounded-lg p-4 max-h-32 overflow-y-auto">
          <div className="text-white text-sm font-medium mb-2">Все шаги:</div>
          <div className="space-y-1">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(index)}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  index === currentStepIndex
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {index + 1}. {step.type} - {step.content.substring(0, 30)}...
              </button>
            ))}
          </div>
        </div>
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



