"use client";
import { useEffect, useState } from 'react';
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
}

export default function AdminBotUsers() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [botUsers, setBotUsers] = useState<BotUser[]>([]);
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState<'all'|'premium'|'inactive'|'zodiac'>('all');
  const [inactiveDays, setInactiveDays] = useState(7);
  const [zodiac, setZodiac] = useState('');
  const [sort, setSort] = useState<'last_active'|'name'|'created_at'|'message_count'>('last_active');
  const [order, setOrder] = useState<'ASC'|'DESC'>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadBotUsers();
    }
  }, [user, currentPage, query, segment, inactiveDays, zodiac, sort, order]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success && (data.user.role === 'admin' || data.user.role === 'manager')) {
        setUser(data.user);
      } else {
        router.replace('/auth');
      }
    } catch (error) {
      router.replace('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBotUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(query && { search: query }),
        ...(segment && { segment }),
        ...(segment === 'inactive' && { inactive_days: inactiveDays.toString() }),
        ...(segment === 'zodiac' && { zodiac }),
        ...(sort && { sort }),
        ...(order && { order })
      });
      
      const response = await fetch(`/api/admin/bot-users?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setBotUsers(data.data.users || []);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading bot users:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.back()}
              className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"
            >
              ←
            </button>
            <h1 className="text-xl font-semibold">Пользователи бота</h1>
          </div>
          <div className="text-sm text-zinc-400">
            Всего: {botUsers.length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-3">
        <input 
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none" 
          placeholder="Поиск по имени, username, telegram_id или знаку зодиака" 
          value={query} 
          onChange={e => { setQuery(e.target.value); setCurrentPage(1) }} 
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select value={segment} onChange={e=>{setSegment(e.target.value as any); setCurrentPage(1)}} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white">
            <option value="all">Все пользователи</option>
            <option value="premium">Только премиум</option>
            <option value="inactive">Неактивные</option>
            <option value="zodiac">По знаку зодиака</option>
          </select>
          {segment === 'inactive' && (
            <div>
              <input 
                type="number" 
                min={1} 
                value={inactiveDays} 
                onChange={e=>setInactiveDays(parseInt(e.target.value||'7',10))} 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white" 
                placeholder="Дней"
              />
            </div>
          )}
          {segment === 'zodiac' && (
            <div>
              <input 
                value={zodiac} 
                onChange={e=>setZodiac(e.target.value)} 
                placeholder="Напр.: Стрелец" 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white" 
              />
            </div>
          )}
          <select value={sort} onChange={e=>{setSort(e.target.value as any); setCurrentPage(1)}} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white">
            <option value="last_active">По активности</option>
            <option value="name">По имени</option>
            <option value="created_at">По регистрации</option>
            <option value="message_count">По сообщениям</option>
          </select>
          <select value={order} onChange={e=>{setOrder(e.target.value as any); setCurrentPage(1)}} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white">
            <option value="DESC">По убыванию</option>
            <option value="ASC">По возрастанию</option>
          </select>
        </div>
      </div>

      {/* Bot Users Table */}
      <div className="p-4">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="text-left p-4 text-zinc-400 font-medium">Пользователь</th>
                  <th className="text-left p-4 text-zinc-400 font-medium">Telegram</th>
                  <th className="text-left p-4 text-zinc-400 font-medium">Знак зодиака</th>
                  <th className="text-left p-4 text-zinc-400 font-medium">Статус</th>
                  <th className="text-left p-4 text-zinc-400 font-medium">Сообщения</th>
                  <th className="text-left p-4 text-zinc-400 font-medium">Активность</th>
                  <th className="text-left p-4 text-zinc-400 font-medium">Регистрация</th>
                </tr>
              </thead>
              <tbody>
                {botUsers.map(botUser => (
                  <tr key={botUser.id} className="border-t border-zinc-800">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{botUser.name}</div>
                        {botUser.username && (
                          <div className="text-sm text-zinc-400">@{botUser.username}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-300 font-mono">
                        {botUser.telegram_id}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-sm">
                        {botUser.zodiac_sign || 'Не указан'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {botUser.is_premium ? (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-sm">
                            ⭐ Premium
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-sm">
                            Free
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-300">{botUser.message_count}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-zinc-400">
                        {formatDateTime(botUser.last_active)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-zinc-400">
                        {formatDate(botUser.created_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 rounded transition-colors"
            >
              ←
            </button>
            <span className="px-3 py-2 text-zinc-400">
              {currentPage} из {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 rounded transition-colors"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}







