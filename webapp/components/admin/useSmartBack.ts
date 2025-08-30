"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export const useSmartBack = (fallback: string) => {
  const router = useRouter();
  const pathname = usePathname();
  
  return () => {
    console.log('🔙 Smart back called from:', pathname, 'fallback:', fallback);
    
    try {
      // Проверяем, есть ли история навигации
      if (window.history.length > 1) {
        // Проверяем referrer только если он существует и с того же домена
        const ref = document.referrer;
        if (ref && ref.length > 0) {
          try {
            const refUrl = new URL(ref);
            const sameOrigin = refUrl.origin === location.origin;
            
            // Не возвращаемся на страницы авторизации или если referrer пустой
            if (sameOrigin && !ref.includes("/auth") && !ref.includes("/login")) {
              console.log('🔙 Using browser back, referrer:', ref);
              router.back();
              return;
            }
          } catch (urlError) {
            console.warn('⚠️ Invalid referrer URL:', ref);
          }
        }
      }
      
      // Если не можем использовать back, используем fallback
      console.log('🔙 Using fallback navigation to:', fallback);
      router.replace(fallback);
      
    } catch (error) {
      console.error('❌ Smart back error:', error);
      // При ошибке используем fallback
      router.replace(fallback);
    }
  };
};





