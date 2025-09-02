"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AuthBottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthBottomSheetModal({ isOpen, onClose }: AuthBottomSheetModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();
  const router = useRouter();

  // Сброс формы при открытии/закрытии
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setName('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const success = await login(email, password, rememberMe);
        if (success) {
          onClose();
          // Обновляем страницу, чтобы показать авторизованный контент
          window.location.reload();
        } else {
          setError('Неверный email или пароль');
        }
      } else {
        const success = await register(name, email, password);
        if (success) {
          onClose();
          window.location.reload();
        } else {
          setError('Ошибка регистрации');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet Content */}
      <div className="relative w-full bg-zinc-900 rounded-t-3xl p-6 transform transition-transform duration-300 ease-out animate-slide-up">
        {/* Handle */}
        <div className="w-12 h-1 bg-zinc-600 rounded-full mx-auto mb-6"></div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center transition-colors"
          aria-label="Закрыть"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Content */}
        <div className="max-w-sm mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Elyse Astro</h2>
            <p className="text-zinc-400">Войдите или зарегистрируйтесь</p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-zinc-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Регистрация
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (only for registration) */}
            {!isLogin && (
              <div>
                <label className="block text-sm text-zinc-300 mb-2">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                  placeholder="Ваше имя"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-zinc-300 mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Remember Me (only for login) */}
            {isLogin && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-zinc-800 border-zinc-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-zinc-300">
                  Запомнить меня
                </label>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isLogin ? 'Вход...' : 'Регистрация...'}
                </div>
              ) : (
                isLogin ? 'Войти' : 'Зарегистрироваться'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 pt-6 border-t border-zinc-700">
            <p className="text-xs text-zinc-500">@Elyse_Astro_bot</p>
          </div>
        </div>
      </div>
    </div>
  );
}
