"use client";

import { useRouter } from "next/navigation";

export const useSmartBack = (fallback: string) => {
  const router = useRouter();
  return () => {
    try {
      const ref = document.referrer;
      const sameOrigin = ref && new URL(ref).origin === location.origin;
      if (sameOrigin && !ref.includes("/auth")) {
        router.back();
        return;
      }
    } catch {}
    router.replace(fallback);
  };
};





