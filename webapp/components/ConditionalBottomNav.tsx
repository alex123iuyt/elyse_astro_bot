'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ls } from '../lib/storage';
import BottomNav from './BottomNav';

export default function ConditionalBottomNav() {
  const pathname = usePathname();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Не показываем навигацию на auth странице
    if (pathname === '/auth') {
      setShouldShow(false);
      return;
    }

    // Проверяем роль
    const role = ls.get('elyse.role', null);
    
    // Админ не видит обычную навигацию, только админку
    if (role === 'admin') {
      setShouldShow(false);
      return;
    }
    
    // Обычные пользователи видят навигацию независимо от наличия профиля
    setShouldShow(!!role);
  }, [pathname]);

  if (!shouldShow) {
    return null;
  }

  return <BottomNav />;
}
