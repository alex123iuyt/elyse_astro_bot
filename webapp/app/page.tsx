"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ls } from '../lib/storage';
import StoryCard from '../components/StoryCard';
import StoryViewer, { Story } from '../components/StoryViewer';

import { useAuth } from '../contexts/AuthContext';
import { LunarSheet } from '@/components/LunarSheet';

const mockStories = [
  {
    id: '1',
    title: 'Совет дня',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    text: 'Сегодня благоприятный день для новых начинаний'
  },
  {
    id: '2', 
    title: 'Лунная энергия',
    image: 'https://images.unsplash.com/photo-1532978379173-523e16f371f9?w=400&h=600&fit=crop',
    text: 'Луна в растущей фазе усиливает ваши намерения'
  },
  {
    id: '3',
    title: 'Звездный совет',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop', 
    text: 'Время прислушаться к интуиции'
  }
];

export default function HomePage() {
  const router = useRouter();
  const [showChat, setShowChat] = useState(false);
  const [profileData, setProfileData] = useState({ name: 'Алекс' });
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [lunarOpen, setLunarOpen] = useState(false);
  const [todayMoon, setTodayMoon] = useState<any>(null);
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Load profile data
    const savedProfile = ls.get('elyse.profile', { name: 'Алекс' });
    setProfileData(savedProfile);
    
    // Load today's moon data
    const loadTodayMoon = async () => {
      try {
        const today = new Date();
        const iso = today.toISOString().substring(0, 10);
        const response = await fetch(`/api/content/lunar-today?date=${iso}`);
        const data = await response.json();
        if (data?.success) {
          setTodayMoon(data.data);
        }
      } catch (error) {
        console.error('Failed to load moon data:', error);
      }
    };
    
    loadTodayMoon();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      // User is authenticated, show chat popup after 3 seconds
      const timer = setTimeout(() => setShowChat(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, router]);

  // Автоматически перенаправляем на /today для всех авторизованных пользователей
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/today');
    }
  }, [isAuthenticated, user, router]);

  // Для неавторизованных пользователей показываем загрузку и перенаправляем
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Перенаправляем на Today...</p>
        </div>
      </div>
    );
  }

  // Для авторизованных пользователей показываем загрузку перед редиректом
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Перенаправляем на Today...</p>
      </div>
    </div>
  );
}



