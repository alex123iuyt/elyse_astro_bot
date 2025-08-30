"use client";

import Link from 'next/link'

export default function Header({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Link href="/profile" className="text-2xl font-serif hover:opacity-90">{name || 'Guest'}</Link>
        <div className="flex items-center gap-3 mt-2 opacity-90">
          <span>☉ Virgo</span>
          <span>↑ Libra</span>
          <span>☾ Scorpio</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xl">
        <Link href="/settings">⚙️</Link>
        <Link href="/profile">💎</Link>
      </div>
    </div>
  )
}















