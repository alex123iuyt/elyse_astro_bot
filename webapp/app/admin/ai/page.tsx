"use client";
import { useState, useEffect } from 'react'
import { generate } from '../../../lib/ai'
import { getRole } from '../../../lib/role'
import { useRouter } from 'next/navigation'

export default function AdminAI(){
  const [kind, setKind] = useState<'daily'|'weekly'|'monthly'|'natal_basic'|'synastry_basic'|'lunar'|'retro'>('daily')
  const [zodiac, setZodiac] = useState('Дева')
  const [name, setName] = useState('Тест')
  const [date, setDate] = useState('2025-08-19')
  const [out, setOut] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const role = getRole()
    setIsAdmin(role === 'admin')
    if (role !== 'admin') {
      router.replace('/')
      return
    }
  }, [router])

  const run = async () => { setOut('...'); const text = await generate(kind, { zodiac, name, date }); setOut(text) }

  if (!isAdmin) {
    return <div className="p-4">Проверка прав доступа...</div>
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">AI Песочница</h1>
      <div className="grid grid-cols-2 gap-3">
        <select className="bg-zinc-900 rounded-xl p-3" value={kind} onChange={e=>setKind(e.target.value as any)}>
          <option value="daily">День</option>
          <option value="weekly">Неделя</option>
          <option value="monthly">Месяц</option>
          <option value="natal_basic">Наталка</option>
          <option value="synastry_basic">Совместимость</option>
          <option value="lunar">Луна</option>
          <option value="retro">Ретро</option>
        </select>
        <input className="bg-zinc-900 rounded-xl p-3" placeholder="Знак" value={zodiac} onChange={e=>setZodiac(e.target.value)} />
        <input className="bg-zinc-900 rounded-xl p-3" placeholder="Имя" value={name} onChange={e=>setName(e.target.value)} />
        <input className="bg-zinc-900 rounded-xl p-3" placeholder="Дата" value={date} onChange={e=>setDate(e.target.value)} />
      </div>
      <button className="btn" onClick={run}>Сгенерировать</button>
      {out && <pre className="whitespace-pre-wrap text-sm opacity-90">{out}</pre>}
    </div>
  )
}

