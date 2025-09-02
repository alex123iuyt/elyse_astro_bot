"use client";

import { useMemo, useState } from 'react'

export function DatePickerRow({ onChange }: { onChange?: (d: Date) => void }) {
  const now = new Date()
  const [selected, setSelected] = useState(new Date(now))
  const days = useMemo(() => {
    const base = new Date(now)
    base.setDate(base.getDate() - 2)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      return d
    })
  }, [now])

  const weekDay = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short' })
  const day = (d: Date) => d.getDate()

  const select = (d: Date) => {
    setSelected(d)
    onChange?.(d)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {days.map(d => {
        const active = d.toDateString() === selected.toDateString()
        return (
          <button
            key={d.toISOString()}
            onClick={() => select(d)}
            className={`min-w-14 px-3 py-2 rounded-xl border ${active ? 'bg-emerald-500/30 border-emerald-400' : 'border-white/10 bg-white/5'} flex flex-col items-center`}
          >
            <div className="text-xs opacity-80">{weekDay(d)}</div>
            <div className="text-lg font-semibold">{day(d)}</div>
          </button>
        )
      })}
    </div>
  )
}


















