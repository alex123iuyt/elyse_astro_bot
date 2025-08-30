"use client";
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTelegram } from '../../components/useTelegram'

type Profile = {
  focus: string[]
  birthDate?: string
  birthTime?: string
  timeUnknown?: boolean
  city?: string
  tz?: string
  gender?: 'male' | 'female' | 'nb'
}

export default function OnboardingPage() {
  const router = useRouter()
  const { tg } = useTelegram()
  const [profile, setProfile] = useState<Profile>({ focus: [] })

  useEffect(() => {
    const raw = localStorage.getItem('profile')
    if (raw) setProfile(JSON.parse(raw))
  }, [])

  const toggleFocus = (k: string) => {
    setProfile(p => {
      const has = p.focus.includes(k)
      const next = { ...p, focus: has ? p.focus.filter(x => x !== k) : [...p.focus, k] }
      return next
    })
  }

  const save = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const next = { ...profile, tz }
    localStorage.setItem('profile', JSON.stringify(next))
    router.push('/')
  }

  const f = ['отношения','карьера','деньги','энергия','саморазвитие']

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Онбординг</h1>

      <div className="space-y-2">
        <div className="opacity-80">Твои цели</div>
        <div className="grid grid-cols-2 gap-2">
          {f.map(k => (
            <button key={k} onClick={() => toggleFocus(k)} className={`card ${profile.focus.includes(k) ? 'ring-2 ring-emerald-400' : ''}`}>{k}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm opacity-80">Дата рождения</label>
        <input type="date" className="card" value={profile.birthDate || ''} onChange={e => setProfile(p => ({...p, birthDate: e.target.value}))} />
      </div>

      <div className="grid grid-cols-2 gap-2 items-center">
        <div className="space-y-2">
          <label className="block text-sm opacity-80">Время</label>
          <input type="time" className="card" value={profile.birthTime || ''} onChange={e => setProfile(p => ({...p, birthTime: e.target.value}))} disabled={profile.timeUnknown} />
        </div>
        <label className="inline-flex items-center gap-2 mt-6">
          <input type="checkbox" checked={!!profile.timeUnknown} onChange={e => setProfile(p => ({...p, timeUnknown: e.target.checked}))} />
          <span>Не знаю время</span>
        </label>
      </div>

      <div className="space-y-2">
        <label className="block text-sm opacity-80">Город рождения</label>
        <input className="card" placeholder="Город" value={profile.city || ''} onChange={e => setProfile(p => ({...p, city: e.target.value}))} />
      </div>

      <button className="btn w-full" onClick={save}>Сохранить</button>
    </div>
  )
}
















