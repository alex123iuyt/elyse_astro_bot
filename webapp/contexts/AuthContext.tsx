"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string | number;
  email: string;
  name: string;
  role: string;
  zodiac_sign?: string;
  is_premium?: boolean;
  birth_date?: string;
  birth_city?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    // Предотвращаем повторные вызовы
    if (isLoading === false) {
      return;
    }
    
    try {
      console.log('🔍 Checking authentication...');
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      
      if (data?.success) {
        console.log('✅ User authenticated:', data.user.email);
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        console.log('❌ User not authenticated');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      console.log('🔐 Calling logout API...');
      const response = await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
      
      if (response.ok) {
        console.log('✅ Logout API successful');
      } else {
        console.warn('⚠️ Logout API returned non-OK status:', response.status);
      }
    } catch (error) {
      console.error('❌ Logout API error:', error);
    } finally {
      console.log('🧹 Clearing local state...');
      // Очищаем состояние независимо от результата API
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      
      // Очищаем все локальные данные
      localStorage.clear();
      sessionStorage.clear();
      
      // Очищаем cookies на клиенте (если они есть)
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      console.log('✅ Local state cleared');
    }
  };

  useEffect(() => {
    // Стартуем синхронно: сначала считаем пользователя из cookie
    // (на стороне клиента у нас нет доступа к httpOnly, поэтому делаем быстрый вызов без кеша)
    if (isLoading) {
      checkAuth();
    }
  }, [isLoading]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



