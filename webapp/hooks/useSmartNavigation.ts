"use client";

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

interface NavigationOptions {
  fallback?: string;
  preventLoop?: boolean;
  clearHistory?: boolean;
}

export function useSmartNavigation(options: NavigationOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const {
    fallback = '/today',
    preventLoop = true,
    clearHistory = false
  } = options;

  const navigateTo = useCallback((path: string) => {
    console.log('🧭 Navigating to:', path, 'from:', pathname);
    
    // Предотвращаем зацикливание
    if (preventLoop && path === pathname) {
      console.log('⚠️ Preventing navigation loop to same path');
      return;
    }
    
    // Проверяем валидность пути
    if (!path || path === '') {
      console.warn('⚠️ Invalid path, using fallback');
      router.replace(fallback);
      return;
    }
    
    // Если нужно очистить историю
    if (clearHistory) {
      router.replace(path);
    } else {
      router.push(path);
    }
  }, [router, pathname, fallback, preventLoop, clearHistory]);

  const goBack = useCallback((customFallback?: string) => {
    const targetFallback = customFallback || fallback;
    console.log('🔙 Going back, fallback:', targetFallback);
    
    try {
      // Проверяем, есть ли история навигации
      if (window.history.length > 1) {
        // Проверяем referrer
        const ref = document.referrer;
        if (ref && ref.length > 0) {
          try {
            const refUrl = new URL(ref);
            const sameOrigin = refUrl.origin === location.origin;
            
            // Не возвращаемся на страницы авторизации
            if (sameOrigin && !ref.includes("/auth") && !ref.includes("/login")) {
              console.log('🔙 Using browser back, referrer:', ref);
              router.back();
              return;
            }
          } catch (urlError) {
            console.warn('⚠️ Invalid referrer URL:', ref);
          }
        }
        
        // Если referrer не подходит, но есть история
        console.log('🔙 Using browser back (no valid referrer)');
        router.back();
        return;
      }
      
      // Если нет истории, используем fallback
      console.log('🔙 No history, using fallback:', targetFallback);
      router.replace(targetFallback);
      
    } catch (error) {
      console.error('❌ Navigation back error:', error);
      router.replace(targetFallback);
    }
  }, [router, fallback]);

  const goHome = useCallback(() => {
    console.log('🏠 Going home');
    navigateTo('/today');
  }, [navigateTo]);

  const goToAuth = useCallback(() => {
    console.log('🔐 Going to auth');
    router.replace('/auth');
  }, [router]);

  return {
    navigateTo,
    goBack,
    goHome,
    goToAuth,
    currentPath: pathname
  };
}
