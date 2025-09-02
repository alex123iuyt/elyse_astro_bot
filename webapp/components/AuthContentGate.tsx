"use client";

import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthBottomSheetModal from './AuthBottomSheetModal';

interface AuthContentGateProps {
  children: ReactNode;
  requireAuth?: boolean;
  blurContent?: boolean;
  title?: string;
  description?: string;
  className?: string;
}

export function AuthContentGate({
  children,
  requireAuth = true,
  blurContent = true,
  title = "Персональный контент",
  description = "Войдите в аккаунт, чтобы получить персональные прогнозы и натальную карту",
  className = ""
}: AuthContentGateProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  // Для неавторизованных показываем контент с блюром и кнопкой
  return (
    <div className={`relative ${className}`}>
      {/* Контент с блюром */}
      {blurContent && (
        <div className="blur-sm pointer-events-none select-none pb-20">
          {children}
        </div>
      )}
      
      {/* Overlay с призывом к авторизации */}
      <div className={`${blurContent ? 'absolute inset-x-0 top-0 bottom-20' : ''} flex items-center justify-center pb-4 min-h-[400px] pointer-events-none`}>
        <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 text-center max-w-sm mx-auto pointer-events-auto">
          {/* Иконка */}
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          {/* Заголовок */}
          <h3 className="text-xl font-bold text-white mb-3">
            {title}
          </h3>
          
          {/* Описание */}
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            {description}
          </p>
          
          {/* Единственная кнопка входа */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            Войти в аккаунт
          </button>
          
          {/* Преимущества */}
          <div className="mt-6 pt-4 border-t border-zinc-700">
            <p className="text-xs text-zinc-500 mb-3">Получите доступ к:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded">
                🔮 Натальная карта
              </span>
              <span className="px-2 py-1 bg-pink-600/20 text-pink-300 text-xs rounded">
                💫 Персональные прогнозы
              </span>
              <span className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded">
                ❤️ Совместимость
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthBottomSheetModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

// Компонент для быстрого создания публичного контента
export function PublicContent({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <AuthContentGate 
      requireAuth={false} 
      className={className}
    >
      {children}
    </AuthContentGate>
  );
}

// Компонент для контента только для авторизованных
export function PrivateContent({ 
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
    <AuthContentGate 
      requireAuth={true}
      title={title}
      description={description}
      className={className}
    >
      {children}
    </AuthContentGate>
  );
}