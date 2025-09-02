"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ls } from '../../lib/storage';
import { PublicContent } from '../../components/AuthContentGate';

type MonthItem = { dateISO: string; day: number; phasePercent: number; phaseName: string; icon: string; moonSign?: string };

export default function LunarPage() {
  const router = useRouter();
  useEffect(() => { ls.get('elyse.role', 'user'); }, []);

  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'calendar'>('calendar');
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 });
  const [items, setItems] = useState<MonthItem[]>([]);
  const [selected, setSelected] = useState<MonthItem | null>(null);
  const [todayData, setTodayData] = useState<any>(null);
  const [tomorrowData, setTomorrowData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const r = await fetch(`/api/content/lunar-month?year=${cursor.year}&month=${cursor.month}`);
      const json = await r.json();
      if (json?.success) setItems(json.data.items);
    };
    load();
  }, [cursor]);

  useEffect(() => {
    const t = new Date();
    const iso = t.toISOString().substring(0,10);
    const tmr = new Date(t.getTime()+86400000).toISOString().substring(0,10);
    fetch(`/api/content/lunar-today?date=${iso}`).then(r=>r.json()).then(j=>{ if(j?.success) setTodayData(j.data) });
    fetch(`/api/content/lunar-today?date=${tmr}`).then(r=>r.json()).then(j=>{ if(j?.success) setTomorrowData(j.data) });
  }, []);

  const monthLabel = new Date(Date.UTC(cursor.year, cursor.month - 1, 1)).toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
  const firstWeekday = new Date(Date.UTC(cursor.year, cursor.month - 1, 1)).getUTCDay(); // 0..6 (воскр)
  const emptyCells = Array.from({ length: firstWeekday }).map((_, i) => <div key={`e-${i}`} />);

  return (
    <PublicContent>
      <div className="min-h-screen bg-black text-white">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Лунный календарь</h1>
            <button onClick={() => router.back()} className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">←</button>
          </div>
        </div>

        <div className="p-4 space-y-6">
        {/* Табы */}
        <div className="bg-zinc-900/60 rounded-2xl p-1 inline-flex">
          {(['today','tomorrow','calendar'] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-xl text-sm ${activeTab===t?'bg-zinc-700 text-white':'text-zinc-300'}`}>
              {t==='today'?'Сегодня':t==='tomorrow'?'Завтра':'Календарь'}
            </button>
          ))}
        </div>

        {activeTab!=='calendar' && (
          <div className="space-y-6">
            {activeTab==='today' && todayData && (
              <div className="space-y-6">
                <div className="text-2xl font-semibold">Луна в {todayData.sign}</div>
                <div className="bg-green-500/15 border border-green-500/25 rounded-2xl p-4">
                  <div className="text-green-400 font-semibold mb-2">Do</div>
                  <div className="text-zinc-200">{todayData.do}</div>
                </div>
                <div className="bg-red-500/15 border border-red-500/25 rounded-2xl p-4">
                  <div className="text-red-400 font-semibold mb-2">Don’t</div>
                  <div className="text-zinc-200">{todayData.dont}</div>
                </div>
                <div className="bg-zinc-900 rounded-2xl p-4">
                  <div className="text-lg font-semibold mb-2">Ritual for you</div>
                  <div className="text-emerald-400 font-medium">Daily practice:</div>
                  <div className="text-zinc-200 mb-2">{todayData.ritual.practice}</div>
                  <div className="text-emerald-400 font-medium">How it works:</div>
                  <div className="text-zinc-200">{todayData.ritual.how}</div>
                </div>
              </div>
            )}
            {activeTab==='tomorrow' && tomorrowData && (
              <div className="space-y-6">
                <div className="text-2xl font-semibold">Луна в {tomorrowData.sign}</div>
                <div className="bg-green-500/15 border border-green-500/25 rounded-2xl p-4">
                  <div className="text-green-400 font-semibold mb-2">Do</div>
                  <div className="text-zinc-200">{tomorrowData.do}</div>
                </div>
                <div className="bg-red-500/15 border border-red-500/25 rounded-2xl p-4">
                  <div className="text-red-400 font-semibold mb-2">Don’t</div>
                  <div className="text-zinc-200">{tomorrowData.dont}</div>
                </div>
                <div className="bg-zinc-900 rounded-2xl p-4">
                  <div className="text-lg font-semibold mb-2">Ritual for you</div>
                  <div className="text-emerald-400 font-medium">Daily practice:</div>
                  <div className="text-zinc-200 mb-2">{tomorrowData.ritual.practice}</div>
                  <div className="text-emerald-400 font-medium">How it works:</div>
                  <div className="text-zinc-200">{tomorrowData.ritual.how}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Навигация месяца */}
        {activeTab==='calendar' && (
        <div className="flex items-center justify-between">
          <button className="px-3 py-1 text-zinc-400 hover:text-white" onClick={() => setCursor(p=>({year:p.month===1?p.year-1:p.year, month:p.month===1?12:p.month-1}))}>←</button>
          <div className="text-3xl font-serif capitalize">{monthLabel}</div>
          <button className="px-3 py-1 text-zinc-400 hover:text-white" onClick={() => setCursor(p=>({year:p.month===12?p.year+1:p.year, month:p.month===12?1:p.month+1}))}>→</button>
        </div>
        )}

        {/* Сетка календаря */}
        {activeTab==='calendar' && (
        <div className="grid grid-cols-7 gap-4 text-sm">
          <div className="text-red-400 text-center">ВС</div>
          <div className="text-zinc-400 text-center">ПН</div>
          <div className="text-zinc-400 text-center">ВТ</div>
          <div className="text-zinc-400 text-center">СР</div>
          <div className="text-zinc-400 text-center">ЧТ</div>
          <div className="text-zinc-400 text-center">ПТ</div>
          <div className="text-zinc-400 text-center">СБ</div>
          {emptyCells}
          {items.map(d => (
            <button key={d.dateISO} onClick={() => setSelected(d)} className="text-center focus:outline-none">
              <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl" title={`${d.phaseName} • ${d.phasePercent}%`}>{d.icon}</span>
              </div>
              <div className="text-xs text-zinc-400">{d.day}</div>
            </button>
          ))}
        </div>
        )}

        {activeTab==='calendar' && (
          <div className="mt-8 bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-3">
            <div className="text-lg font-semibold">Фазы Луны — расшифровка</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🌑</div>
                <div>
                  <div className="font-medium">Новая луна</div>
                  <div className="text-zinc-400">Начало цикла, планирование и намерения. Энергия на старте.</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🌒</div>
                <div>
                  <div className="font-medium">Растущий серп</div>
                  <div className="text-zinc-400">Мягкий старт, первые шаги, питание растущих проектов.</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🌓</div>
                <div>
                  <div className="font-medium">Первая четверть</div>
                  <div className="text-zinc-400">Решительность, преодоление препятствий, корректировки.</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🌔</div>
                <div>
                  <div className="font-medium">Растущая луна</div>
                  <div className="text-zinc-400">Наращивание ресурсов, развитие, активный рост.</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🌕</div>
                <div>
                  <div className="font-medium">Полнолуние</div>
                  <div className="text-zinc-400">Пик энергии, проявление результатов, эмоциональная полнота.</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🌖</div>
                <div>
                  <div className="font-medium">Убывающая луна</div>
                  <div className="text-zinc-400">Завершение, анализ, отпускание лишнего.</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🌗</div>
                <div>
                  <div className="font-medium">Последняя четверть</div>
                  <div className="text-zinc-400">Подведение итогов, переоценка, исправление ошибок.</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🌘</div>
                <div>
                  <div className="font-medium">Стареющий серп</div>
                  <div className="text-zinc-400">Отдых, восстановление, мягкая подготовка к новому циклу.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модалка дня */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={()=>setSelected(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">{new Date(selected.dateISO).toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric' })}</div>
              <button className="w-8 h-8 bg-zinc-800 rounded-full" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className="text-4xl mb-2">{selected.icon}</div>
            <div className="text-zinc-300 mb-1">{selected.phaseName}</div>
            <div className="text-zinc-400 text-sm">Освещенность: {selected.phasePercent}%</div>
          </div>
        </div>
      )}
      </div>
    </PublicContent>
  );
}

