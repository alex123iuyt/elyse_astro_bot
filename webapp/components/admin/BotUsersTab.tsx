"use client";
import { useEffect, useState } from 'react';

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

export default function BotUsersTab() {
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
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadBotUsers();
    
    // Автоматически обновляем каждые 10 секунд
    const interval = setInterval(loadBotUsers, 10000);
    return () => clearInterval(interval);
  }, [currentPage, query, segment, inactiveDays, zodiac, sort, order]);

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
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading bot users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.')) {
      return;
    }

    setDeletingUser(userId);
    
    try {
      const response = await fetch(`/api/admin/bot-users/${userId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Удаляем пользователя из локального состояния
        setBotUsers(prev => prev.filter(user => user.id !== userId));
        alert('Пользователь успешно удален');
      } else {
        alert(data.error || 'Ошибка удаления пользователя');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Ошибка сети');
    } finally {
      setDeletingUser(null);
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
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Пользователи бота</h2>
        <div className="bg-zinc-900 rounded-2xl p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Загрузка пользователей...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Пользователи бота</h2>
      
      {/* Search and Filters */}
      <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Управление пользователями Telegram бота</h3>
            {lastUpdated && (
              <p className="text-xs text-zinc-500 mt-1">
                Последнее обновление: {lastUpdated.toLocaleTimeString('ru-RU')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadBotUsers}
              disabled={isLoading}
              className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 rounded-lg text-sm flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                  Обновление...
                </>
              ) : (
                <>
                  🔄 Обновить
                </>
              )}
            </button>
            <div className="text-sm text-zinc-400">
              Всего: {botUsers.length}
            </div>
          </div>
        </div>
        
        <input 
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none" 
          placeholder="Поиск по имени, username, telegram_id или знаку зодиака" 
          value={query} 
          onChange={e => { setQuery(e.target.value); setCurrentPage(1) }} 
        />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select value={segment} onChange={e=>{setSegment(e.target.value as any); setCurrentPage(1)}} className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white">
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
          <select value={sort} onChange={e=>{setSort(e.target.value as any); setCurrentPage(1)}} className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white">
            <option value="last_active">По активности</option>
            <option value="name">По имени</option>
            <option value="created_at">По регистрации</option>
            <option value="message_count">По сообщениям</option>
          </select>
          <select value={order} onChange={e=>{setOrder(e.target.value as any); setCurrentPage(1)}} className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white">
            <option value="DESC">По убыванию</option>
            <option value="ASC">По возрастанию</option>
          </select>
        </div>
      </div>

      {/* Bot Users Table */}
      {botUsers.length === 0 ? (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 text-center">
          <div className="text-zinc-400 mb-4">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-lg mb-2">Нет пользователей бота</p>
            <p className="text-sm">Пользователи появятся после отправки /start боту</p>
          </div>
          <button
            onClick={loadBotUsers}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            🔄 Обновить
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
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
                <th className="text-left p-4 text-zinc-400 font-medium">Действия</th>
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
                  <td className="p-4">
                    <button
                      onClick={() => handleDeleteUser(botUser.id)}
                      disabled={deletingUser === botUser.id}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white text-sm rounded transition-colors"
                    >
                      {deletingUser === botUser.id ? 'Удаление...' : 'Удалить'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
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
  );
}
