"use client";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LogoutButton(){
  const router = useRouter();
  const { logout } = useAuth();

  const onLogout = async () => {
    try {
      console.log('🚪 Client logout initiated...');
      await logout();
      console.log('✅ Client logout successful');
      
      // Очищаем все локальные данные
      localStorage.clear();
      sessionStorage.clear();
      
      // Перенаправляем на страницу входа
      router.replace('/auth');
    } catch (error) {
      console.error('❌ Client logout error:', error);
      
      // Даже при ошибке очищаем состояние и перенаправляем
      localStorage.clear();
      sessionStorage.clear();
      router.replace('/auth');
    }
  };

  return (
    <button 
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200" 
      onClick={onLogout}
    >
      Выйти
    </button>
  );
}









