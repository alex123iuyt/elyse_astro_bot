"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BotUser {
  id: string;
  telegram_id: string;
  name: string;
  username?: string;
  birth_date?: string;
  birth_city?: string;
  timezone?: string;
  zodiac_sign?: string;
  is_premium: boolean;
  last_active: string;
  created_at: string;
  message_count: number;
  is_registered: boolean;
  registration_status: 'registered' | 'unregistered';
  user_id?: number;
  email?: string;
  role?: string;
  subscription_type?: string;
  days_since_last_active: number;
  activity_status: 'active' | 'inactive';
}

interface BotUsersStats {
  total: number;
  registered: number;
  unregistered: number;
  active: number;
  inactive: number;
  premium: number;
}

export default function BotUsersPage() {
  const [users, setUsers] = useState<BotUser[]>([]);
  const [stats, setStats] = useState<BotUsersStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'registered' | 'unregistered' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/bot-users');
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.users);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading bot users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    // Применяем фильтр по статусу
    if (filter === 'registered' && !user.is_registered) return false;
    if (filter === 'unregistered' && user.is_registered) return false;
    if (filter === 'active' && user.activity_status !== 'active') return false;
    if (filter === 'inactive' && user.activity_status !== 'inactive') return false;
    
    // Применяем поиск
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        (user.username && user.username.toLowerCase().includes(searchLower)) ||
        user.telegram_id.includes(search) ||
        (user.zodiac_sign && user.zodiac_sign.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  const getStatusBadge = (user: BotUser) => {
    if (user.is_registered) {
      return (
        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
          ✅ Зарегистрирован
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
          👤 Незарегистрирован
        </span>
      );
    }
  };

  const getActivityBadge = (user: BotUser) => {
    if (user.activity_status === 'active') {
      return (
        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
          🔵 Активен
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
          ⚫ Неактивен
        </span>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-400">Загрузка пользователей бота...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Пользователи бота</h1>
          <p className="text-zinc-400">Управление пользователями Telegram бота</p>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-sm text-zinc-400">Всего</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <div className="text-2xl font-bold text-green-400">{stats.registered}</div>
              <div className="text-sm text-zinc-400">Зарегистрированы</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <div className="text-2xl font-bold text-yellow-400">{stats.unregistered}</div>
              <div className="text-sm text-zinc-400">Не зарегистрированы</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <div className="text-2xl font-bold text-blue-400">{stats.active}</div>
              <div className="text-sm text-zinc-400">Активны</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <div className="text-2xl font-bold text-gray-400">{stats.inactive}</div>
              <div className="text-sm text-zinc-400">Неактивны</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <div className="text-2xl font-bold text-purple-400">{stats.premium}</div>
              <div className="text-sm text-zinc-400">Premium</div>
            </div>
          </div>
        )}

        {/* Фильтры и поиск */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Поиск по имени, username или Telegram ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Все пользователи</option>
            <option value="registered">Только зарегистрированные</option>
            <option value="unregistered">Только незарегистрированные</option>
            <option value="active">Только активные</option>
            <option value="inactive">Только неактивные</option>
          </select>
          <button
            onClick={loadUsers}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            🔄 Обновить
          </button>
        </div>

        {/* Таблица пользователей */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Активность
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Telegram ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Сообщения
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Последняя активность
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        {user.username && (
                          <div className="text-sm text-zinc-400">@{user.username}</div>
                        )}
                        {user.email && (
                          <div className="text-sm text-blue-400">{user.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4">
                      {getActivityBadge(user)}
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-zinc-800 rounded text-sm">
                        {user.telegram_id}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{user.message_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{new Date(user.last_active).toLocaleDateString('ru-RU')}</div>
                        <div className="text-zinc-400">
                          {user.days_since_last_active > 0 
                            ? `${user.days_since_last_active} дн. назад`
                            : 'Сегодня'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {user.is_registered ? (
                          <button
                            onClick={() => window.open(`/admin/users/${user.user_id}`, '_blank')}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                          >
                            👁️ Профиль
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                            Нет профиля
                          </span>
                        )}
                        {user.zodiac_sign && user.zodiac_sign !== 'Unknown' && (
                          <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                            {user.zodiac_sign}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-zinc-400">
            <p className="text-lg">Пользователи не найдены</p>
            <p className="text-sm text-zinc-500 mt-2">Попробуйте изменить фильтры или поиск</p>
          </div>
        )}
      </div>
    </div>
  );
}









