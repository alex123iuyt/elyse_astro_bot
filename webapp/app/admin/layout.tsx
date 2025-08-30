"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '/admin/dashboard';

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/auth?next=/admin/dashboard&scope=admin');
    }
  }, [isAuthenticated, user, router]);

  // Рендерим каркас сразу, чтобы не было "мигания" при быстрой навигации.

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />
      <div className="ml-[264px] min-h-screen flex flex-col">
        <AdminHeader
          title={
            pathname.startsWith('/admin/users') ? 'Пользователи бота' :
            pathname.startsWith('/admin/content') ? 'Контент' :
            false ? 'Маркетинг' :
            pathname.startsWith('/admin/staff') ? 'Сотрудники' :
            pathname.startsWith('/admin/settings') ? 'Настройки' :
            pathname.startsWith('/admin/integrations') ? 'Интеграции' :
            pathname.startsWith('/admin/logs') ? 'Логи' :
            'Дашборд'
          }
          backFallback={
            pathname.startsWith('/admin/users') ? '/admin/users' :
            pathname.startsWith('/admin/content') ? '/admin/content' :
            '/admin/dashboard'
          }
        />
        <main className="flex-1 overflow-auto bg-zinc-950 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
