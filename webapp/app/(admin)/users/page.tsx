"use client";
import { useEffect, useState } from 'react'

type User = { id:string; name:string; zodiac?:string; isPremium?:boolean }

export default function AdminUsers(){
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  useEffect(()=>{ setUsers([{id:'1',name:'Алиса',zodiac:'Дева'},{id:'2',name:'Боб',zodiac:'Рак',isPremium:true}]) },[])
  const filtered = users.filter(u => !query || u.name.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Пользователи</h1>
      <input className="w-full bg-zinc-900 rounded-xl p-3" placeholder="Поиск" value={query} onChange={e=>setQuery(e.target.value)} />
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-zinc-400"><tr><th className="text-left p-2">ID</th><th className="text-left p-2">Имя</th><th className="text-left p-2">Знак</th><th className="text-left p-2">Премиум</th><th className="text-left p-2">Действия</th></tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t border-zinc-800">
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.zodiac ?? '—'}</td>
                <td className="p-2">{u.isPremium ? '⭐' : '—'}</td>
                <td className="p-2 space-x-2">
                  <button className="px-3 py-1 rounded bg-zinc-800">Отправить прогноз</button>
                  <button className="px-3 py-1 rounded bg-zinc-800">Тумблер премиум</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


