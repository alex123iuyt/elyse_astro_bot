"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSmartBack } from "./useSmartBack";

type AdminHeaderProps = {
  title: string;
  backFallback?: string;
  actionsRight?: React.ReactNode;
  showClose?: boolean;
  onClose?: () => void;
};

export function AdminHeader({ title, backFallback = "/admin/dashboard", actionsRight, showClose, onClose }: AdminHeaderProps) {
  const pathname = usePathname();
  const goBack = useSmartBack(backFallback);

  // Кнопка "назад" всегда видна, но может быть неактивна
  const isBackDisabled = pathname === "/admin/dashboard";

  return (
    <div className="admin-header grid grid-cols-[auto,1fr,auto] items-center h-14 px-4 border-b border-zinc-800">
      {/* Левая кнопка - всегда "назад" */}
      <div className="w-9 flex justify-center">
        <button
          data-testid="back"
          onClick={goBack}
          disabled={isBackDisabled}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-all ${
            isBackDisabled 
              ? 'text-zinc-600 cursor-not-allowed opacity-50' 
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          aria-label="Back"
          title={isBackDisabled ? "Вы уже на главной странице" : "Назад"}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
      </div>
      
      {/* Центральный заголовок */}
      <div className="min-w-0 text-center">
        <h1 className="truncate text-base font-semibold text-white">{title}</h1>
      </div>
      
      {/* Правая часть - действия и кнопка закрытия */}
      <div className="w-9 flex justify-center">
        {actionsRight || (showClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        ))}
      </div>
    </div>
  );
}





