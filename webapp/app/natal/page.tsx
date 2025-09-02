"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ls } from '../../lib/storage';
import { PrivateContent } from '../../components/AuthContentGate';


export default function NatalPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [natalChartData, setNatalChartData] = useState<any>(null);
  
  useEffect(() => {
    const role = ls.get('elyse.role', 'user');
    const natalChart = ls.get('elyse.natalChart', null);
    setIsAdmin(role === 'admin');
    if (natalChart) setNatalChartData(natalChart);
  }, []);

  // Если нет данных натальной карты, показываем сообщение
  if (!natalChartData || Object.keys(natalChartData).length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Натальная карта</h1>
            <button 
              onClick={() => router.back()}
              className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"
            >
              ←
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-purple-500/20 rounded-3xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">🔮</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">Профиль не заполнен</h2>
          <p className="text-zinc-400 mb-6">
            Для просмотра натальной карты необходимо заполнить профиль. Перейдите в раздел "Профиль" и заполните данные.
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Заполнить профиль
          </button>
        </div>
      </div>
    );
  }

  const natalData = {
    sun: {
      sign: 'Стрелец',
      degree: '15°',
      house: '5-й дом',
      description: 'Ваше Солнце в Стрельце наделяет вас оптимизмом, любознательностью и стремлением к приключениям. Вы естественный лидер с философским взглядом на жизнь.'
    },
    moon: {
      sign: 'Весы',
      degree: '22°',
      house: '4-й дом',
      description: 'Луна в Весах делает вас чувствительным к гармонии и красоте. Вы цените равновесие в отношениях и стремитесь к миру в семье.'
    },
    ascendant: {
      sign: 'Весы',
      degree: '8°',
      house: '1-й дом',
      description: 'Асцендент в Весах создает обаятельную и дипломатичную внешность. Вы производите впечатление уравновешенного и элегантного человека.'
    }
  };

  return (
    <PrivateContent
      title="Ваша натальная карта"
      description="Войдите в аккаунт и заполните данные о рождении, чтобы получить персональную натальную карту и детальный астрологический анализ"
    >
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Натальная карта</h1>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push('/natal-wizard')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm transition-colors"
              >
                ✏️ Редактировать
              </button>
              <button 
                onClick={() => router.back()}
                className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"
              >
                ←
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-6">
        {/* User Info */}
        {natalChartData && (
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-emerald-500/30 rounded-full flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{natalChartData.name}</h2>
                <div className="text-emerald-300 text-lg">Натальная карта</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-zinc-400 mb-1">Дата рождения</div>
                <div className="text-zinc-200">{natalChartData.birthDate}</div>
              </div>
              <div>
                <div className="text-zinc-400 mb-1">Время рождения</div>
                <div className="text-zinc-200">{natalChartData.birthTime}</div>
              </div>
              <div>
                <div className="text-zinc-400 mb-1">Место рождения</div>
                <div className="text-zinc-200">{natalChartData.birthCity}, {natalChartData.birthCountry}</div>
              </div>
              <div>
                <div className="text-zinc-400 mb-1">Пол</div>
                <div className="text-zinc-200">
                  {natalChartData.gender === 'male' ? 'Мужской' : 
                   natalChartData.gender === 'female' ? 'Женский' : 'Другой'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Natal Chart Blocks */}
        <div className="space-y-4">
          {/* Sun Block */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-yellow-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">☀️</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">Солнце</h3>
                  <span className="text-yellow-300 font-medium">{natalData.sun.sign}</span>
                  <span className="text-yellow-300/70 text-sm">{natalData.sun.degree}</span>
                </div>
                <div className="text-zinc-300 text-sm mb-2">{natalData.sun.house}</div>
                <p className="text-zinc-200 leading-relaxed">{natalData.sun.description}</p>
              </div>
            </div>
          </div>

          {/* Moon Block */}
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🌙</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">Луна</h3>
                  <span className="text-blue-300 font-medium">{natalData.moon.sign}</span>
                  <span className="text-blue-300/70 text-sm">{natalData.moon.degree}</span>
                </div>
                <div className="text-zinc-300 text-sm mb-2">{natalData.moon.house}</div>
                <p className="text-zinc-200 leading-relaxed">{natalData.moon.description}</p>
              </div>
            </div>
          </div>

          {/* Ascendant Block */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-emerald-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">⭐</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">Асцендент</h3>
                  <span className="text-emerald-300 font-medium">{natalData.ascendant.sign}</span>
                  <span className="text-emerald-300/70 text-sm">{natalData.ascendant.degree}</span>
                </div>
                <div className="text-zinc-300 text-sm mb-2">{natalData.ascendant.house}</div>
                <p className="text-zinc-200 leading-relaxed">{natalData.ascendant.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-zinc-900 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Дополнительная информация</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-zinc-400 mb-1">Стихия</div>
              <div className="text-emerald-300">Огонь + Воздух</div>
            </div>
            <div>
              <div className="text-zinc-400 mb-1">Модальность</div>
              <div className="text-emerald-300">Мутабельная</div>
            </div>
            <div>
              <div className="text-zinc-400 mb-1">Планета-управитель</div>
              <div className="text-emerald-300">Юпитер</div>
            </div>
            <div>
              <div className="text-zinc-400 mb-1">Дом</div>
              <div className="text-emerald-300">5-й дом</div>
            </div>
          </div>
        </div>

        {/* Premium Upgrade */}
        {!isAdmin && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">🔮</div>
            <h3 className="text-lg font-semibold mb-2">Полный разбор натальной карты</h3>
            <p className="text-zinc-300 mb-4">Получите детальный анализ всех планет, аспектов и домов для глубокого понимания своей личности</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Активировать премиум
            </button>
          </div>
        )}
        </div>
      </div>
    </PrivateContent>
  );
}


