"use client";

import { useEffect, useState } from "react";

type MonthItem = { dateISO: string; day: number; phasePercent: number; phaseName: string; icon: string };

export function LunarSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
  });
  const [items, setItems] = useState<MonthItem[]>([]);
  const [today, setToday] = useState<any>(null);
  const [tomorrow, setTomorrow] = useState<any>(null);
  const [tab, setTab] = useState<'today' | 'tomorrow' | 'calendar'>('calendar');

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      const r = await fetch(`/api/content/lunar-month?year=${cursor.year}&month=${cursor.month}`);
      const j = await r.json();
      if (j?.success) setItems(j.data.items);
    };
    load();
  }, [cursor, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const t = new Date();
    const iso = t.toISOString().substring(0, 10);
    const tmr = new Date(t.getTime() + 86400000).toISOString().substring(0, 10);
    fetch(`/api/content/lunar-today?date=${iso}`).then(r => r.json()).then(j => { if (j?.success) setToday(j.data); });
    fetch(`/api/content/lunar-today?date=${tmr}`).then(r => r.json()).then(j => { if (j?.success) setTomorrow(j.data); });
  }, [isOpen]);

  if (!isOpen) return null;

  const monthLabel = new Date(Date.UTC(cursor.year, cursor.month - 1, 1)).toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
  const firstWeekday = new Date(Date.UTC(cursor.year, cursor.month - 1, 1)).getUTCDay();
  const empty = Array.from({ length: firstWeekday }).map((_, i) => <div key={`e-${i}`} />);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 bg-black border-t border-zinc-800 rounded-t-2xl p-4 max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-zinc-900/60 rounded-2xl p-1 inline-flex">
            {(['today','tomorrow','calendar'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm ${tab===t?'bg-zinc-700 text-white':'text-zinc-300'}`}>
                {t==='today'?'Сегодня':t==='tomorrow'?'Завтра':'Календарь'}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-zinc-800 rounded-full">✕</button>
        </div>

        {tab === 'today' && today && (
          <div className="space-y-6">
            <div className="text-2xl font-semibold">Луна в {today.sign}</div>
            <div className="bg-green-500/15 border border-green-500/25 rounded-2xl p-4">
              <div className="text-green-400 font-semibold mb-2">Do</div>
              <div className="text-zinc-200">{today.do}</div>
            </div>
            <div className="bg-red-500/15 border border-red-500/25 rounded-2xl p-4">
              <div className="text-red-400 font-semibold mb-2">Don’t</div>
              <div className="text-zinc-200">{today.dont}</div>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-4">
              <div className="text-lg font-semibold mb-2">Ritual for you</div>
              <div className="text-emerald-400 font-medium">Daily practice:</div>
              <div className="text-zinc-200 mb-2">{today.ritual.practice}</div>
              <div className="text-emerald-400 font-medium">How it works:</div>
              <div className="text-zinc-200">{today.ritual.how}</div>
            </div>
          </div>
        )}

        {tab === 'tomorrow' && tomorrow && (
          <div className="space-y-6">
            <div className="text-2xl font-semibold">Луна в {tomorrow.sign}</div>
            <div className="bg-green-500/15 border border-green-500/25 rounded-2xl p-4">
              <div className="text-green-400 font-semibold mb-2">Do</div>
              <div className="text-zinc-200">{tomorrow.do}</div>
            </div>
            <div className="bg-red-500/15 border border-red-500/25 rounded-2xl p-4">
              <div className="text-red-400 font-semibold mb-2">Don’t</div>
              <div className="text-zinc-200">{tomorrow.dont}</div>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-4">
              <div className="text-lg font-semibold mb-2">Ritual for you</div>
              <div className="text-emerald-400 font-medium">Daily practice:</div>
              <div className="text-zinc-200 mb-2">{tomorrow.ritual.practice}</div>
              <div className="text-emerald-400 font-medium">How it works:</div>
              <div className="text-zinc-200">{tomorrow.ritual.how}</div>
            </div>
          </div>
        )}

        {tab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button className="px-3 py-1 text-zinc-400 hover:text-white" onClick={() => setCursor(p=>({year:p.month===1?p.year-1:p.year, month:p.month===1?12:p.month-1}))}>←</button>
              <div className="text-2xl font-serif capitalize">{monthLabel}</div>
              <button className="px-3 py-1 text-zinc-400 hover:text-white" onClick={() => setCursor(p=>({year:p.month===12?p.year+1:p.year, month:p.month===12?1:p.month+1}))}>→</button>
            </div>
            <div className="grid grid-cols-7 gap-4 text-sm">
              <div className="text-red-400 text-center">ВС</div>
              <div className="text-zinc-400 text-center">ПН</div>
              <div className="text-zinc-400 text-center">ВТ</div>
              <div className="text-zinc-400 text-center">СР</div>
              <div className="text-zinc-400 text-center">ЧТ</div>
              <div className="text-zinc-400 text-center">ПТ</div>
              <div className="text-zinc-400 text-center">СБ</div>
              {empty}
              {items.map(d => (
                <div key={d.dateISO} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl" title={`${d.phaseName} • ${d.phasePercent}%`}>{d.icon}</span>
                  </div>
                  <div className="text-xs text-zinc-400">{d.day}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


