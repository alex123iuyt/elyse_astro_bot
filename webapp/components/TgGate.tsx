"use client";

import { useEffect, useState } from 'react'

function isTgWebAppPresent(): boolean {
  const w = window as any
  const byObj = !!w?.Telegram?.WebApp
  const byHash = typeof location !== 'undefined' && (
    location.hash.includes('tgWebApp') || location.hash.includes('tgWebAppData')
  )
  return byObj || byHash
}

export default function TgGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false)

  useEffect(() => {
    let cancelled = false
    const t = setTimeout(() => {
      try {
        const w = window as any
        const tg = w?.Telegram?.WebApp
        if (isTgWebAppPresent()) {
          tg?.ready?.()
          tg?.expand?.()
          if (!cancelled) setOk(true)
        } else {
          if (!cancelled) setOk(false)
        }
      } catch {
        if (!cancelled) setOk(false)
      }
    }, 50)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [])

  if (!ok) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Open in Telegram</h1>
        <p>Запустите Mini App из чата с ботом.</p>
      </main>
    )
  }

  return <>{children}</>
}


