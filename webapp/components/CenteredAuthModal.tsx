"use client";

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthBottomSheetModal from './AuthBottomSheetModal';

interface CenteredAuthModalProps {
  title?: string;
  description?: string;
  showContent?: boolean;
  children?: React.ReactNode;
}

export default function CenteredAuthModal({
  title = "Персональный прогноз",
  description = "Получите детальный астрологический прогноз на основе вашей натальной карты",
  showContent = false,
  children
}: CenteredAuthModalProps) {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Если пользователь авторизован, показываем контент
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Для неавторизованных пользователей показываем блокирующую модалку
  return (
    <>
      {/* Фиксированный оверлей на весь экран */}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        {/* Контент с размытием на заднем плане (опционально) */}
        {showContent && children && (
          <div className="absolute inset-0 blur-sm pointer-events-none select-none opacity-30">
            {children}
          </div>
        )}

        {/* Центрированная модалка авторизации */}
        <div className="relative z-10 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 text-center max-w-md w-full mx-auto">
          {/* Иконка */}
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          {/* Заголовок */}
          <h2 className="text-2xl font-bold text-white mb-4">
            {title}
          </h2>
          
          {/* Описание */}
          <p className="text-zinc-400 text-base mb-8 leading-relaxed">
            {description}
          </p>
          
          {/* Кнопка входа */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 text-lg"
          >
            Войти в аккаунт
          </button>
          
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
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthBottomSheetModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
