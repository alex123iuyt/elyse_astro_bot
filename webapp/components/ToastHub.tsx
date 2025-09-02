"use client";
import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastState {
  id: number;
  type: ToastType;
  message: string;
}

export default function ToastHub() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    let counter = 1;
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const toast: ToastState = {
        id: counter++,
        type: detail.type || "info",
        message: String(detail.message || "")
      };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, Math.min(8000, Math.max(2000, detail.duration || 3500)));
    };

    window.addEventListener("app:toast", onToast as EventListener);
    return () => window.removeEventListener("app:toast", onToast as EventListener);
  }, []);

  const bgByType: Record<ToastType, string> = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-zinc-800",
  };

  return (
    <div className="pointer-events-none fixed top-4 left-0 right-0 z-[1000] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto ${bgByType[t.type]} text-white rounded-xl px-4 py-3 shadow-xl max-w-md w-full`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm leading-snug">{t.message}</div>
            <button
              className="text-white/80 hover:text-white"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}










