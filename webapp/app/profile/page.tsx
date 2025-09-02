"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ls } from '../../lib/storage';
import { useAuth } from '../../contexts/AuthContext';
import { PrivateContent } from '../../components/AuthContentGate';


interface NatalChartData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
  gender: string;
  relationshipStatus: string;
  occupation: string;
  interests: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  const [natalChartData, setNatalChartData] = useState<NatalChartData | null>(
    ls.get('elyse.natalChart', null)
  );
  const [notifications, setNotifications] = useState({
    push: ls.get('elyse.notifications.push', true),
    daily: ls.get('elyse.notifications.daily', true),
    weekly: ls.get('elyse.notifications.weekly', false)
  });
  
  useEffect(() => {
    const role = ls.get('elyse.role', 'user') as any;
    setIsAdmin(role === 'admin');
    // На публичной стороне не делаем принудительных редиректов
  }, []);

  const handleToggle = (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    setNotifications(prev => ({ ...prev, [key]: newValue }));
    ls.set(`elyse.notifications.${key}`, newValue);
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { logout } = useAuth();

  const handleLogout = async () => {
    if (isLoggingOut) return; // Защита от множественных кликов
    
    setIsLoggingOut(true);
    
    try {
      // Используем функцию logout из контекста
      await logout();
      
      // Перенаправляем на страницу входа
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      // В случае ошибки всё равно уводим на страницу входа
      router.replace('/auth');
    } finally {
      setIsLoggingOut(false);
    }
  };



  const profileData = {
    name: natalChartData?.name || 'Алекс',
    zodiac: 'Стрелец',
    birthDate: natalChartData?.birthDate || '15 декабря 1995',
    birthTime: natalChartData?.birthTime || '14:30',
    city: natalChartData?.birthCity || 'Москва',
    timezone: 'UTC+3'
  };

  const isProfileComplete = natalChartData && 
    natalChartData.name && 
    natalChartData.birthDate && 
    natalChartData.birthTime && 
    natalChartData.birthCity;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Профиль</h1>
          <button 
            onClick={() => router.back()}
            className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"
          >
            ←
          </button>
        </div>
      </div>

      {/* Main Content */}
      <PrivateContent
        title="Личный профиль"
        description="Войдите в аккаунт, чтобы настроить свой профиль, натальную карту и получать персональные прогнозы"
      >
        <div className="p-4 space-y-6 pb-24">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-20 h-20 bg-emerald-500/30 rounded-full flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profileData.name}</h2>
              <div className="text-emerald-300 text-lg">{profileData.zodiac}</div>
              {!isProfileComplete && (
                <div className="text-yellow-400 text-sm mt-1">Профиль не заполнен</div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-zinc-400 mb-1">Дата рождения</div>
              <div className="text-zinc-200">{profileData.birthDate}</div>
            </div>
            <div>
              <div className="text-zinc-400 mb-1">Время рождения</div>
              <div className="text-zinc-200">{profileData.birthTime}</div>
            </div>
            <div>
              <div className="text-zinc-400 mb-1">Город</div>
              <div className="text-zinc-200">{profileData.city}</div>
            </div>
            <div>
              <div className="text-zinc-400 mb-1">Часовой пояс</div>
              <div className="text-zinc-200">{profileData.timezone}</div>
            </div>
          </div>

          {/* Natal Chart Button */}
          <div className="mt-6">
            <button
              onClick={() => router.push('/natal-wizard')}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                isProfileComplete
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {isProfileComplete ? 'Изменить натальную карту' : 'Заполнить натальную карту'}
            </button>
          </div>
        </div>

        {/* Additional Profile Info */}
        {natalChartData && (
          <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold">Дополнительная информация</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {natalChartData.gender && (
                <div>
                  <div className="text-zinc-400 mb-1">Пол</div>
                  <div className="text-zinc-200">
                    {natalChartData.gender === 'male' ? 'Мужской' : 
                     natalChartData.gender === 'female' ? 'Женский' : 'Другой'}
                  </div>
                </div>
              )}
              
              {natalChartData.relationshipStatus && (
                <div>
                  <div className="text-zinc-400 mb-1">Семейное положение</div>
                  <div className="text-zinc-200">
                    {natalChartData.relationshipStatus === 'single' ? 'Холост/Не замужем' :
                     natalChartData.relationshipStatus === 'relationship' ? 'В отношениях' :
                     natalChartData.relationshipStatus === 'married' ? 'Женат/Замужем' : 'Сложно'}
                  </div>
                </div>
              )}
              
              {natalChartData.occupation && (
                <div className="col-span-2">
                  <div className="text-zinc-400 mb-1">Профессия</div>
                  <div className="text-zinc-200">{natalChartData.occupation}</div>
                </div>
              )}
            </div>

            {natalChartData.interests.length > 0 && (
              <div>
                <div className="text-zinc-400 mb-2">Интересы</div>
                <div className="flex flex-wrap gap-2">
                  {natalChartData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-sm text-emerald-300"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notification Settings */}
        <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold">Уведомления</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🔔</span>
                </div>
                <div>
                  <div className="font-medium">Push-уведомления</div>
                  <div className="text-sm text-zinc-400">Общие уведомления приложения</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={() => handleToggle('push')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">☀️</span>
                </div>
                <div>
                  <div className="font-medium">Дневной прогноз (09:00)</div>
                  <div className="text-sm text-zinc-400">Ежедневные астрологические советы</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.daily}
                  onChange={() => handleToggle('daily')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">📅</span>
                </div>
                <div>
                  <div className="font-medium">Недельный прогноз (пн 10:00)</div>
                  <div className="text-sm text-zinc-400">Прогноз на неделю вперед</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.weekly}
                  onChange={() => handleToggle('weekly')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold">Аккаунт</h3>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">⚙️</span>
                </div>
                <span>Настройки</span>
              </div>
              <span className="text-zinc-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">💎</span>
                </div>
                <span>Премиум подписка</span>
              </div>
              <span className="text-zinc-400">→</span>
            </button>
          </div>
        </div>

        {/* Premium Features */}
        {!isAdmin && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">🔮</div>
            <h3 className="text-lg font-semibold mb-2">Персональный астролог</h3>
            <p className="text-zinc-300 mb-4">Получите доступ к индивидуальным консультациям и персональным прогнозам</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Активировать премиум
            </button>
          </div>
        )}

        {/* Logout Section - в самом низу */}
        <div className="bg-zinc-900 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Выход из системы</h3>
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center p-4 bg-red-500/20 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-lg">{isLoggingOut ? '⏳' : '🚪'}</span>
              </div>
              <span className="text-red-300 font-medium">
                {isLoggingOut ? 'Выход...' : 'Выйти из аккаунта'}
              </span>
            </div>
          </button>
          <p className="text-xs text-zinc-500 mt-3 text-center">
            После выхода вы будете перенаправлены на страницу входа
          </p>
        </div>
        </div>
      </PrivateContent>
    </div>
  );
}


