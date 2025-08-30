"use client";
import { useState } from 'react';

interface StoryCardProps {
  id: string;
  title: string;
  image: string;
  text: string;
  onClick?: () => void;
}

export default function StoryCard({ id, title, image, text, onClick }: StoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div 
      className="bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer hover:bg-zinc-800 transition-colors"
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        </div>
      </div>
      
      <div className="p-4">
        <p className={`text-zinc-300 transition-all duration-300 ${
          isExpanded ? 'line-clamp-none' : 'line-clamp-2'
        }`}>
          {text}
        </p>
        
        {!onClick && (
          <button 
            className="mt-3 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'Свернуть' : 'Читать далее'}
          </button>
        )}
      </div>
    </div>
  );
}







