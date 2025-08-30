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
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.clear();
      // UI слой решит, куда уводить. Для админки — в лэйауте.
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



