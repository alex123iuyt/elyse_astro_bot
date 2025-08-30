"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ls } from '../lib/storage';

const items = (isAdmin: boolean) => [
  { href: '/today', label: 'Сегодня', icon: '🎯' },
  { href: '/chat', label: 'Консультация', icon: '💬' },
  { href: '/tarot', label: 'Таро', icon: '🔮' },
  { href: '/compat', label: 'Совместимость', icon: '💕' },
  ...(isAdmin ? [{ href: '/admin', label: 'Админ', icon: '⚙️' }] : []),
];

export default function BottomNav() {
  const pathname = usePathname();
  const role = ls.get('elyse.role', 'user') as any;
  const isAdmin = role === 'admin';
  
  // Hide navigation on auth page and admin pages
  if (pathname === '/auth' || pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = items(isAdmin);
  const gridCols = navItems.length === 4 ? 'grid-cols-4' : navItems.length === 5 ? 'grid-cols-5' : 'grid-cols-6';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-black/90 backdrop-blur">
      <div className={`grid ${gridCols} max-w-xl mx-auto`}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-3 text-sm transition-colors ${
              pathname === item.href
                ? 'text-emerald-400'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
            {pathname === item.href && (
              <div className="w-1 h-1 bg-emerald-400 rounded-full mt-1"></div>
            )}
          </Link>
        ))}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-1 bg-black"></div>
    </nav>
  );
}


