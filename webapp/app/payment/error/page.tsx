"use client";

import { useRouter } from 'next/navigation';

export default function PaymentErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto">
          <span className="text-5xl">❌</span>
        </div>
        
        <h1 className="text-3xl font-bold text-red-400">Ошибка платежа</h1>
        
        <div className="space-y-4">
          <p className="text-lg text-zinc-300">
            К сожалению, произошла ошибка при обработке платежа
          </p>
          
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-300 font-medium">
              Ваша подписка не была активирована
            </p>
          </div>
        </div>

        {/* Possible Reasons */}
        <div className="bg-zinc-800 rounded-xl p-4 text-left">
          <h3 className="font-semibold mb-2 text-zinc-300">Возможные причины:</h3>
          <ul className="text-sm text-zinc-400 space-y-1">
            <li>• Недостаточно средств на карте</li>
            <li>• Карта заблокирована банком</li>
            <li>• Превышен лимит операций</li>
            <li>• Технические проблемы банка</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/premium')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Попробовать снова
          </button>
          
          <button
            onClick={() => router.push('/today')}
            className="w-full bg-zinc-600 hover:bg-zinc-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Вернуться в приложение
          </button>
        </div>

        {/* Support Info */}
        <div className="text-xs text-zinc-500 space-y-1">
          <p>Если проблема повторяется, обратитесь в поддержку</p>
          <p>Деньги не были списаны с вашей карты</p>
        </div>
      </div>
    </div>
  );
}

