"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ls } from '../lib/storage';

const navigationItems = (isAdmin: boolean) => [
  { href: '/today', label: 'Сегодня', icon: '🎯' },
  { href: '/chat', label: 'Консультация', icon: '💬' },
  { href: '/tarot', label: 'Таро', icon: '🔮' },
  { href: '/compat', label: 'Совместимость', icon: '💕' },
  ...(isAdmin ? [{ href: '/admin', label: 'Админ', icon: '⚙️' }] : []),
];

export default function GlobalNavigation() {
  const pathname = usePathname();
  const role = ls.get('elyse.role', 'user') as any;
  const isAdmin = role === 'admin';
  
  // Hide navigation on auth page and admin pages (except admin dashboard link)
  if (pathname === '/auth' || pathname === '/register' || pathname === '/onboarding' || 
      (pathname.startsWith('/admin') && pathname !== '/admin')) {
    return null;
  }

  const navItems = navigationItems(isAdmin);
  const gridCols = navItems.length === 4 ? 'grid-cols-4' : navItems.length === 5 ? 'grid-cols-5' : 'grid-cols-6';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t border-zinc-800 bg-black/98 backdrop-blur-xl">
      <div className={`grid ${gridCols} max-w-xl mx-auto`}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-3 px-2 transition-colors ${
              pathname === item.href
                ? 'text-emerald-400 bg-emerald-400/10'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium leading-tight text-center">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
      
      {/* Safe area for mobile devices */}
      <div className="h-safe-bottom bg-black/98"></div>
    </nav>
  );
}

