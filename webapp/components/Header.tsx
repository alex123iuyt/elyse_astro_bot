"use client";

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

type HeaderProps = {
  name: string;
  tags: string[];
  onOpenPremium: () => void;
}

export default function Header({ name, tags, onOpenPremium }: HeaderProps) {
  const [platform, setPlatform] = useState<string>('')
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  
  const isProfile = pathname.startsWith('/profile')
  
  useEffect(() => {
    // Определяем платформу через Telegram WebApp API
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      setPlatform(tg.platform || 'unknown')
      
      // Динамически настраиваем safe areas для разных платформ
      if (tg.platform === 'ios') {
        document.documentElement.style.setProperty('--safe-bottom', 'calc(env(safe-area-inset-bottom) + 20px)')
        document.documentElement.style.setProperty('--safe-top', 'calc(env(safe-area-inset-top) + 8px)')
      } else if (tg.platform === 'android') {
        document.documentElement.style.setProperty('--safe-bottom', 'calc(env(safe-area-inset-bottom) + 16px)')
        document.documentElement.style.setProperty('--safe-top', 'calc(env(safe-area-inset-top) + 4px)')
      }
    }
  }, [])



  return (
    <header className="sticky-header bg-zinc-900/80 border-b border-zinc-800">
      <div className="mx-auto max-w-3xl px-4 py-3">
        {/* Ветка: страница профиля */}
        {isProfile ? (
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="h-9 w-9 grid place-items-center rounded-full hover:bg-white/5 transition-colors"
              aria-label="Back"
            >
              ←
            </button>

            <div className="text-lg font-semibold text-white">Профиль</div>

            <button
              aria-label="Premium"
              onClick={onOpenPremium}
              className="h-9 w-9 grid place-items-center rounded-full hover:bg-white/5 transition-colors"
            >
              💎
            </button>
          </div>
        ) : (
          /* Ветка: главный хедер */
          <>
            <div className="flex items-center justify-between">
              <div>
                <button
                  className="text-2xl font-serif text-white hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() => router.push('/profile')}
                  aria-label="Open profile"
                >
                  {name}
                </button>
                <div className="mt-2 text-sm text-zinc-400 flex items-center gap-3">
                  {tags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Показываем иконку профиля только для авторизованных пользователей */}
                {isAuthenticated && (
                  <button
                    aria-label="Profile"
                    onClick={() => router.push('/profile')}
                    className="h-9 w-9 grid place-items-center rounded-full hover:bg-white/5 transition-colors"
                  >
                    👤
                  </button>
                )}
                <button
                  aria-label="Premium"
                  onClick={() => router.push('/premium')}
                  className="h-9 w-9 grid place-items-center rounded-full hover:bg-white/5 transition-colors"
                >
                  💎
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
