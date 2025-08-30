"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export function Guard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Показываем loading пока проверяем аутентификацию
  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Загрузка...</div>
    </div>;
  }

  // Показываем контент только если пользователь аутентифицирован
  return isAuthenticated ? <>{children}</> : null;
}
