"use client";

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Gender = 'male' | 'female'
type Relation = 'in_rel' | 'engaged' | 'married' | 'post_breakup' | 'single'

export default function RegisterWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<Gender | null>(null)
  const [relation, setRelation] = useState<Relation | null>(null)
  const [city, setCity] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem('profile')
    if (raw) {
      try {
        const p = JSON.parse(raw)
        setName(p.name || '')
        setGender(p.gender || null)
        setRelation(p.relation || null)
        setCity(p.city || '')
        setBirthDate(p.birthDate || '')
        setBirthTime(p.birthTime || '')
      } catch {}
    }
  }, [])

  const next = () => setStep(s => Math.min(6, s + 1))
  const back = () => setStep(s => Math.max(1, s - 1))

  const relationLabel = (r: Relation): string => {
    if (r === 'in_rel') return 'В отношениях'
    if (r === 'engaged') return gender === 'female' ? 'Помолвлена' : 'Помолвлен'
    if (r === 'married') return gender === 'female' ? 'Замужем' : 'Женат'
    if (r === 'post_breakup') return 'После расставания'
    return gender === 'female' ? 'Одинока' : 'Одинок'
  }

  const zodiacIcon: Record<string, string> = {
    'Овен': '♈', 'Телец': '♉', 'Близнецы': '♊', 'Рак': '♋', 'Лев': '♌', 'Дева': '♍',
    'Весы': '♎', 'Скорпион': '♏', 'Стрелец': '♐', 'Козерог': '♑', 'Водолей': '♒', 'Рыбы': '♓',
  }
  const zodiacByDate = (dateIso: string | undefined): { name: string, icon: string } | null => {
    if (!dateIso) return null
    const d = new Date(dateIso)
    if (Number.isNaN(d.getTime())) return null
    const m = d.getUTCMonth() + 1
    const day = d.getUTCDate()
    // Пороги по западной астрологии
    const ranges: Array<[number, number, string]> = [
      [1, 20, 'Водолей'], [2, 19, 'Рыбы'], [3, 21, 'Овен'], [4, 20, 'Телец'],
      [5, 21, 'Близнецы'], [6, 22, 'Рак'], [7, 23, 'Лев'], [8, 23, 'Дева'],
      [9, 23, 'Весы'], [10, 23, 'Скорпион'], [11, 22, 'Стрелец'],
    ]
    let sign = 'Козерог'
    if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) sign = 'Козерог'
    else {
      for (let i = ranges.length - 1; i >= 0; i--) {
        const [mm, dd, s] = ranges[i]
        if (m > mm || (m === mm && day >= dd)) { sign = s; break }
      }
    }
    return { name: sign, icon: zodiacIcon[sign] }
  }

  const finish = () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const profile = { name, gender, relation, city, birthDate, birthTime, tz, isGuest: false }
    localStorage.setItem('profile', JSON.stringify(profile))
    // имитация «аналитики» и расчётов
    const phrases = [
      'Собираем звёздную карту…',
      'Синхронизируемся с планетами…',
      'Считаем аспекты и орбисы…',
      'Готовим персональные подсказки…',
    ]
    const overlay = document.createElement('div')
    overlay.style.position = 'fixed'
    overlay.style.inset = '0'
    overlay.style.background = 'rgba(0,0,0,0.7)'
    overlay.style.display = 'flex'
    overlay.style.flexDirection = 'column'
    overlay.style.alignItems = 'center'
    overlay.style.justifyContent = 'center'
    overlay.style.color = 'white'
    overlay.style.zIndex = '50'
    overlay.innerHTML = `<div style="font-size:24px;margin-bottom:12px">Анализируем ваши данные…</div>
      <div id="ph" style="opacity:.85"></div>
      <div style="margin-top:16px;width:220px;height:6px;border-radius:9999px;background:rgba(255,255,255,.2);overflow:hidden">
        <div id="bar" style="height:100%;width:0%;background:linear-gradient(90deg,#34d399,#22c1c3);"></div>
      </div>`
    document.body.appendChild(overlay)
    let i = 0, w = 0
    const ph = overlay.querySelector('#ph') as HTMLElement
    const bar = overlay.querySelector('#bar') as HTMLElement
    const tick = () => {
      if (!ph || !bar) return
      ph.textContent = phrases[i % phrases.length]
      w = Math.min(100, w + 10)
      bar.style.width = `${w}%`
      i++
    }
    const t = setInterval(tick, 400)
    setTimeout(() => { clearInterval(t); document.body.removeChild(overlay); router.replace('/today') }, 2200)
  }

  return (
    <div className="min-h-dvh bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {step === 1 && (
          <div className="text-center space-y-6 bg-black/40 rounded-2xl p-6">
            <div className="text-2xl font-semibold">Ваше имя</div>
            <input className="card w-full text-center" placeholder="Введите ваше имя" value={name} onChange={e => setName(e.target.value)} />
            <button className="btn w-full" onClick={next} disabled={!name.trim()}>Далее</button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-6 bg-black/40 rounded-2xl p-6">
            <div className="text-2xl font-semibold">Ваш пол</div>
            <div className="grid grid-cols-2 gap-3">
              <button className={`card py-6 ${gender==='male'?'ring-2 ring-emerald-400':''}`} onClick={() => setGender('male')}>Мужчина</button>
              <button className={`card py-6 ${gender==='female'?'ring-2 ring-emerald-400':''}`} onClick={() => setGender('female')}>Женщина</button>
            </div>
            <div className="flex gap-2">
              <button className="card flex-1" onClick={back}>Назад</button>
              <button className="btn flex-1" onClick={next} disabled={!gender}>Далее</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 bg-black/40 rounded-2xl p-6">
            <div className="text-2xl font-semibold">Статус отношений</div>
            <div className="space-y-3">
              {(['in_rel','engaged','married','post_breakup','single'] as Relation[]).map(r => (
                <button key={r} className={`card py-4 w-full ${relation===r?'ring-2 ring-emerald-400':''}`} onClick={() => setRelation(r)}>
                  {relationLabel(r)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="card flex-1" onClick={back}>Назад</button>
              <button className="btn flex-1" onClick={next} disabled={!relation}>Далее</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center space-y-6 bg-black/40 rounded-2xl p-6">
            <div className="text-2xl font-semibold">Город рождения</div>
            <input className="card w-full text-center" placeholder="Введите город" value={city} onChange={e => setCity(e.target.value)} />
            <div className="flex gap-2">
              <button className="card flex-1" onClick={back}>Назад</button>
              <button className="btn flex-1" onClick={next} disabled={!city.trim()}>Далее</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center space-y-6 bg-black/40 rounded-2xl p-6">
            <div className="text-2xl font-semibold">Дата рождения</div>
            {birthDate && (() => { const s = zodiacByDate(birthDate); return s ? (
              <div className="flex items-center justify-center gap-2 opacity-90">
                <div className="text-4xl">{s.icon}</div>
                <div className="text-xl">{s.name}</div>
              </div>
            ) : null })()}
            <input type="date" className="card w-full text-center" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
            <div className="flex gap-2">
              <button className="card flex-1" onClick={back}>Назад</button>
              <button className="btn flex-1" onClick={next} disabled={!birthDate}>Далее</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="text-center space-y-6 bg-black/40 rounded-2xl p-6">
            <div className="text-2xl font-semibold">Время рождения</div>
            <input type="time" className="card w-full text-center" value={birthTime} onChange={e => setBirthTime(e.target.value)} />
            <div className="flex gap-2">
              <button className="card flex-1" onClick={back}>Назад</button>
              <button className="btn flex-1" onClick={finish} disabled={!birthTime}>Готово</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


