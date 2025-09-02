"use client";

import { useAuth } from '../contexts/AuthContext';

export function AuthStatusDemo() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-yellow-400">Проверка авторизации...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs max-w-xs">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="font-medium">
            {isAuthenticated ? 'Авторизован' : 'Не авторизован'}
          </span>
        </div>
        
        {isAuthenticated && user && (
          <div className="text-zinc-400">
            <div>👤 {user.name}</div>
            <div>📧 {user.email}</div>
            <div>🎭 {user.role}</div>
            {user.zodiac_sign && <div>♈ {user.zodiac_sign}</div>}
          </div>
        )}
        
        {!isAuthenticated && (
          <div className="text-zinc-400">
            <div>🔓 Гостевой доступ</div>
            <div>📊 Общий контент</div>
            <div>🚫 Персональный контент заблокирован</div>
          </div>
        )}
      </div>
    </div>
  );
}

