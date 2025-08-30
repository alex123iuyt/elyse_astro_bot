"use client";

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showHome?: boolean;
  onBack?: () => void;
  actionsRight?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  showBack = true, 
  showHome = true, 
  onBack,
  actionsRight 
}: PageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Умная навигация назад
      if (window.history.length > 1) {
        router.back();
      } else {
        // Если нет истории, идем на главную
        router.replace('/today');
      }
    }
  };

  const handleHome = () => {
    router.replace('/today');
  };

  // Определяем, можно ли идти назад
  const canGoBack = showBack && window.history.length > 1;
  // Определяем, нужно ли показывать кнопку домой
  const shouldShowHome = showHome && pathname !== '/today' && pathname !== '/';

  return (
    <div className="sticky top-0 z-40 bg-black/90 backdrop-blur border-b border-zinc-800">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Левая часть - кнопка "назад" */}
        <div className="w-9 flex justify-center">
          {canGoBack && (
            <button
              onClick={handleBack}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              aria-label="Назад"
              title="Назад"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Центральный заголовок */}
        <div className="flex-1 text-center min-w-0">
          <h1 className="truncate text-base font-semibold text-white px-4">{title}</h1>
        </div>

        {/* Правая часть - кнопка "домой" и действия */}
        <div className="w-9 flex justify-center">
          {shouldShowHome ? (
            <button
              onClick={handleHome}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              aria-label="Главная"
              title="Главная"
            >
              <HomeIcon className="h-5 w-5" />
            </button>
          ) : (
            actionsRight
          )}
        </div>
      </div>
    </div>
  );
}
