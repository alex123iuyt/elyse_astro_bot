"use client";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LogoutButton(){
  const router = useRouter();
  const { logout } = useAuth();

  const onLogout = async () => {
    try {
      await logout();
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      // Даже если произошла ошибка, очищаем локальное состояние
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









