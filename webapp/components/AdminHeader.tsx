"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type AdminHeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function AdminHeader({ title, showBack = false, onBack }: AdminHeaderProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      router.replace('/auth');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-zinc-900/95 border-b border-zinc-800 backdrop-blur-sm">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBack && (
              <button
                onClick={handleBack}
                className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label="Back"
              >
                ←
              </button>
            )}
            <h1 className="text-lg font-semibold text-white">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">
              Админ
            </span>
            <button
              onClick={handleLogout}
              className="h-8 w-8 grid place-items-center rounded-full hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
              aria-label="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}







