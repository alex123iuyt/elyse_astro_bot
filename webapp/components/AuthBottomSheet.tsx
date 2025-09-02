"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

interface AuthBottomSheetProps {
  children: ReactNode;
  requireAuth?: boolean;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  className?: string;
}

export function AuthBottomSheet({
  children,
  requireAuth = true,
  title = "Персональный контент",
  description = "Войдите в аккаунт, чтобы получить персональные прогнозы и натальную карту",
  ctaText = "Войти в аккаунт",
  ctaLink = "/auth",
  className = ""
}: AuthBottomSheetProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSheet, setShowSheet] = useState(false);

  // Если загружается авторизация, показываем скелетон
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-zinc-800 rounded-lg h-32 mb-4"></div>
        <div className="bg-zinc-800 rounded h-4 w-3/4 mb-2"></div>
        <div className="bg-zinc-800 rounded h-4 w-1/2"></div>
      </div>
    );
  }

  // Если не требуется авторизация, показываем контент всем
  if (!requireAuth) {
    return <div className={className}>{children}</div>;
  }

  // Если пользователь авторизован, показываем полный контент
  if (isAuthenticated) {
    return <div className={className}>{children}</div>;
  }

  // Для неавторизованных показываем контент с кнопкой
  return (
    <div className={`relative ${className}`}>
      {/* Контент с блюром */}
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>
      
      {/* Кнопка для открытия Bottom Sheet */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={() => setShowSheet(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          🔓 Разблокировать контент
        </button>
      </div>

      {/* Bottom Sheet */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSheet(false)}
          />
          
          {/* Sheet Content */}
          <div className="relative w-full bg-zinc-900 rounded-t-3xl p-6 transform transition-transform duration-300 ease-out">
            {/* Handle */}
            <div className="w-12 h-1 bg-zinc-600 rounded-full mx-auto mb-6"></div>
            
            {/* Close Button */}
            <button 
              onClick={() => setShowSheet(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center transition-colors"
              aria-label="Закрыть"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Content */}
            <div className="text-center max-w-sm mx-auto">
              {/* Иконка */}
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              {/* Заголовок */}
              <h3 className="text-2xl font-bold text-white mb-3">
                {title}
              </h3>
              
              {/* Описание */}
              <p className="text-zinc-400 text-base mb-8 leading-relaxed">
                {description}
              </p>
              
              {/* Кнопки действий */}
              <div className="space-y-4">
                <Link 
                  href={ctaLink}
                  className="block w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                  onClick={() => setShowSheet(false)}
                >
                  {ctaText}
                </Link>
                
                <Link 
                  href="/register"
                  className="block w-full px-6 py-3 text-zinc-300 hover:text-white text-base border border-zinc-600 hover:border-zinc-500 rounded-xl transition-colors"
                  onClick={() => setShowSheet(false)}
                >
                  Создать аккаунт
                </Link>
              </div>
              
              {/* Преимущества */}
              <div className="mt-8 pt-6 border-t border-zinc-700">
                <p className="text-sm text-zinc-500 mb-4">Получите доступ к:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-2 bg-purple-600/20 text-purple-300 text-sm rounded-lg">
                    🔮 Натальная карта
                  </span>
                  <span className="px-3 py-2 bg-pink-600/20 text-pink-300 text-sm rounded-lg">
                    💫 Персональные прогнозы
                  </span>
                  <span className="px-3 py-2 bg-blue-600/20 text-blue-300 text-sm rounded-lg">
                    ❤️ Совместимость
                  </span>
                  <span className="px-3 py-2 bg-green-600/20 text-green-300 text-sm rounded-lg">
                    🃏 Расклады Таро
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент для быстрого создания публичного контента
export function PublicContentSheet({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <AuthBottomSheet 
      requireAuth={false} 
      className={className}
    >
      {children}
    </AuthBottomSheet>
  );
}

// Компонент для контента только для авторизованных с bottom sheet
export function PrivateContentSheet({ 
  children, 
  title,
  description,
  className = "" 
}: { 
  children: ReactNode, 
  title?: string,
  description?: string,
  className?: string 
}) {
  return (
    <AuthBottomSheet 
      requireAuth={true}
      title={title}
      description={description}
      className={className}
    >
      {children}
    </AuthBottomSheet>
  );
}

