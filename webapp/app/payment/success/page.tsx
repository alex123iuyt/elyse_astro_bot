"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/today');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
          <span className="text-5xl">✅</span>
        </div>
        
        <h1 className="text-3xl font-bold text-emerald-400">Оплата успешна!</h1>
        
        <div className="space-y-4">
          <p className="text-lg text-zinc-300">
            Ваша подписка активирована
          </p>
          
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-emerald-300 font-medium">
              Теперь у вас есть доступ ко всем премиум функциям
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="text-center">
          <p className="text-zinc-400 mb-2">
            Перенаправление через {countdown} секунд
          </p>
          <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/today')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Перейти в приложение
          </button>
          
          <button
            onClick={() => router.push('/premium')}
            className="w-full bg-zinc-600 hover:bg-zinc-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Управление подпиской
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-zinc-500 space-y-1">
          <p>Чек отправлен на ваш email</p>
          <p>Подписка будет продлеваться автоматически</p>
        </div>
      </div>
    </div>
  );
}

