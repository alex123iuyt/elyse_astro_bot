"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  CogIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const MENU = [
  { id: "dashboard", label: "Главная", href: "/admin/dashboard", icon: HomeIcon },
  { id: "users", label: "Пользователи бота", href: "/admin/users", icon: UsersIcon },
  { id: "content", label: "Контент", href: "/admin/content", icon: DocumentTextIcon },
  { id: "subscriptions", label: "Подписки", href: "/admin/subscriptions", icon: CreditCardIcon },
  { id: "payments", label: "Платежи", href: "/admin/payments", icon: CurrencyDollarIcon },
  { id: "staff", label: "Сотрудники", href: "/admin/staff", icon: UsersIcon },
  { id: "settings", label: "Настройки", href: "/admin/settings", icon: CogIcon },
  { id: "integrations", label: "Интеграции", href: "/admin/integrations", icon: PuzzlePieceIcon },
  { id: "logs", label: "Логи", href: "/admin/logs", icon: ChartBarIcon },
];

export function Sidebar() {
  const pathname = usePathname() || "/admin/dashboard";
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      await logout();
      console.log('✅ Logout successful, redirecting to auth');
      // Очищаем все локальные данные
      localStorage.clear();
      sessionStorage.clear();
      // Перенаправляем на страницу входа
      router.replace('/auth');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Даже при ошибке очищаем состояние и перенаправляем
      localStorage.clear();
      sessionStorage.clear();
      router.replace('/auth');
    }
  };
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-[264px] bg-zinc-900 border-r border-zinc-800">
      <div className="h-16 flex items-center px-4 border-b border-zinc-800">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-lg">🔮</span>
        </div>
        <span className="ml-3 text-lg font-semibold text-white">Elyse Admin</span>
      </div>
      <nav className="px-3 py-4 space-y-1">
        {MENU.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                active ? "bg-emerald-600 text-white" : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">{user?.name?.charAt(0) || 'A'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Админ'}</p>
            {user?.email && <p className="text-xs text-zinc-400 truncate">{user.email}</p>}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}


