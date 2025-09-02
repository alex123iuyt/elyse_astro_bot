"use client";

import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../store/user';
import Header from './Header';
import CenteredAuthModal from './CenteredAuthModal';

interface PageWithAuthProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showHeaderForGuests?: boolean;
  disableScrollForUnauthorized?: boolean;
  className?: string;
}

export default function PageWithAuth({
  children,
  title = "Персональный контент",
  description = "Войдите в аккаунт, чтобы получить доступ к персональным функциям",
  showHeaderForGuests = true,
  disableScrollForUnauthorized = true,
  className = "min-h-screen bg-black text-white"
}: PageWithAuthProps) {
  const { profile } = useUser();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Если загружается авторизация, показываем загрузку
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем контент...</p>
        </div>
      </div>
    );
  }

  // Для неавторизованных пользователей показываем блокирующую модалку
  if (!isAuthenticated) {
    const containerClass = disableScrollForUnauthorized 
      ? "h-screen overflow-hidden" 
      : className;

    return (
      <div className={containerClass}>
        {showHeaderForGuests && (
          <Header 
            name="Гость" 
            tags={["🌟 Общие прогнозы"]}
            onOpenPremium={() => window.location.href = "/profile"}
          />
        )}
        <CenteredAuthModal
          title={title}
          description={description}
          showContent={true}
        >
          {children}
        </CenteredAuthModal>
      </div>
    );
  }

  // Для авторизованных пользователей показываем полный контент с хедером
  return (
    <div className={className}>
      <Header 
        name={user?.name || profile.name} 
        tags={["☉ Virgo", "↑ Libra", "☾ Scorpio"]}
        onOpenPremium={() => window.location.href = "/profile"}
      />
      {children}
    </div>
  );
}
