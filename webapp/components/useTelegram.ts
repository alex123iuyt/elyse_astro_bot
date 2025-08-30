"use client";

import { useEffect, useMemo, useState } from 'react'

type TG = NonNullable<typeof window> & { Telegram: any }

declare global {
  interface Window { Telegram?: any }
}

export function useTelegram() {
  const [ready, setReady] = useState(false)
  const [verified, setVerified] = useState<boolean | undefined>(undefined)
  const [verifyError, setVerifyError] = useState<string | undefined>(undefined)
  const tg = useMemo(() => (typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined), [])

  useEffect(() => {
    if (!tg) return
    try {
      tg.ready()
      tg.expand()
      setReady(true)
    } catch {}
  }, [tg])

  const initDataUnsafe = tg?.initDataUnsafe
  const initData = tg?.initData as string | undefined
  const user = initDataUnsafe?.user
  const startParam = initDataUnsafe?.start_param
  const colorScheme = tg?.colorScheme as 'light' | 'dark' | undefined

  useEffect(() => {
    if (!tg) return
    const scheme = tg.colorScheme
    document.documentElement.setAttribute('data-theme', scheme)
  }, [tg])

  const setHeaderColor = (color: string) => {
    try { tg?.setHeaderColor?.(color) } catch {}
  }

  useEffect(() => {
    let cancelled = false
    const verify = async () => {
      if (!initData) { setVerified(undefined); return }
      try {
        const res = await fetch('/api/verify', { method: 'POST', body: initData })
        const data = await res.json().catch(() => ({}))
        if (!cancelled) {
          setVerified(!!data?.ok)
          setVerifyError(data?.ok ? undefined : 'Auth failed')
        }
      } catch (e) {
        if (!cancelled) {
          setVerified(false)
          setVerifyError('Network error')
        }
      }
    }
    verify()
    return () => { cancelled = true }
  }, [initData])

  return { tg, ready, initData, initDataUnsafe, user, startParam, colorScheme, verified, verifyError, setHeaderColor }
}



