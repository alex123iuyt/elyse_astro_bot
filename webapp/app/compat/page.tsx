"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ls } from '../../lib/storage';
import { PrivateContent } from '../../components/AuthContentGate';


export default function CompatPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [partnerData, setPartnerData] = useState({
    name: '',
    birthDate: '',
    birthTime: ''
  });
  const [compatibility, setCompatibility] = useState<{
    percentage: number;
    description: string;
    details: string[];
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const role = ls.get('elyse.role', null);
    const natalChart = ls.get('elyse.natalChart', null);
    
    setIsAdmin(role === 'admin');
    
    if (!role) {
      router.push('/');
      return;
    }
    
    // Админ не нуждается в профиле
    if (role === 'admin') {
      router.push('/admin');
      return;
    }
    
    // Обычные пользователи могут быть без профиля
    // Но для совместимости нужен профиль
  }, [router]);

  const calculateCompatibility = async () => {
    if (!partnerData.name || !partnerData.birthDate) {
      alert('Пожалуйста, заполните имя и дату рождения партнера');
      return;
    }

    setIsCalculating(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockCompatibility = {
        percentage: Math.floor(Math.random() * 40) + 60, // 60-100%
        description: 'У вас хорошая совместимость! Ваши знаки дополняют друг друга и создают гармоничную пару.',
        details: [
          'Эмоциональная связь: 85% - вы понимаете чувства друг друга',
          'Интеллектуальная совместимость: 78% - интересные беседы и общие интересы',
          'Физическая привлекательность: 82% - сильное взаимное влечение',
          'Долгосрочные перспективы: 75% - потенциал для серьезных отношений'
        ]
      };
      
      setCompatibility(mockCompatibility);
      setIsCalculating(false);
    }, 2000);
  };

  return (
    <PrivateContent
      title="Астрологическая совместимость"
      description="Войдите в аккаунт, чтобы рассчитать совместимость с партнером на основе натальных карт"
    >
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Совместимость</h1>
            <button 
              onClick={() => router.back()}
              className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"
            >
              ←
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-6">
        {/* Input Form */}
        <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Данные партнера</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Имя партнера</label>
              <input
                type="text"
                value={partnerData.name}
                onChange={(e) => setPartnerData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введите имя"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Дата рождения</label>
              <input
                type="date"
                value={partnerData.birthDate}
                onChange={(e) => setPartnerData(prev => ({ ...prev, birthDate: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Время рождения (опционально)</label>
              <input
                type="time"
                value={partnerData.birthTime}
                onChange={(e) => setPartnerData(prev => ({ ...prev, birthTime: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            onClick={calculateCompatibility}
            disabled={isCalculating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:cursor-not-allowed"
          >
            {isCalculating ? 'Рассчитываем...' : 'Рассчитать совместимость'}
          </button>
        </div>

        {/* Compatibility Result */}
        {compatibility && (
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">💕</div>
              <div className="text-4xl font-bold text-emerald-300 mb-2">
                {compatibility.percentage}%
              </div>
              <div className="text-lg text-emerald-200">
                Совместимость
              </div>
            </div>

            <p className="text-center text-zinc-200 mb-6 leading-relaxed">
              {compatibility.description}
            </p>

            <div className="space-y-3">
              {compatibility.details.map((detail, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-emerald-500/10 rounded-xl">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-zinc-200">{detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premium Features */}
        {!isAdmin && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 text-center">
            <div className="text-2xl mb-2">🔮</div>
            <h3 className="text-lg font-semibold mb-2">Детальный анализ совместимости</h3>
            <p className="text-zinc-300 mb-4">Получите полный разбор всех аспектов ваших отношений, включая кармические связи и будущие перспективы</p>
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



