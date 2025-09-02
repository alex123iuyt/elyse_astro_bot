"use client";

import { PrivateContent } from '../../components/AuthContentGate';


export default function ForecastsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-4">
      <h1 className="text-xl font-semibold">Прогнозы</h1>
      
      <PrivateContent
        title="Персональные прогнозы"
        description="Войдите в аккаунт, чтобы получить персональные астрологические прогнозы на основе вашей натальной карты"
      >
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold mb-2">Ваш персональный прогноз на сегодня</h2>
            <p className="text-sm text-zinc-400 mb-4">На основе вашей натальной карты и текущих транзитов</p>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-lg text-white">
              <h3 className="font-medium mb-2">🌟 Основные тенденции</h3>
              <p className="text-sm">Сегодня Венера в вашем 7-м доме создает благоприятные аспекты для отношений...</p>
            </div>
          </div>
          
          <div className="card">
            <h3 className="font-semibold mb-2">📈 Прогноз по сферам</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-600/20 p-3 rounded-lg">
                <div className="text-red-300 font-medium">❤️ Любовь</div>
                <div className="text-sm text-zinc-300">Высокая активность</div>
              </div>
              <div className="bg-green-600/20 p-3 rounded-lg">
                <div className="text-green-300 font-medium">💼 Карьера</div>
                <div className="text-sm text-zinc-300">Стабильный период</div>
              </div>
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <div className="text-blue-300 font-medium">💰 Финансы</div>
                <div className="text-sm text-zinc-300">Время экономии</div>
              </div>
              <div className="bg-yellow-600/20 p-3 rounded-lg">
                <div className="text-yellow-300 font-medium">🏃 Здоровье</div>
                <div className="text-sm text-zinc-300">Отличное состояние</div>
              </div>
            </div>
          </div>
        </div>
      </PrivateContent>
    </div>
  )
}

















