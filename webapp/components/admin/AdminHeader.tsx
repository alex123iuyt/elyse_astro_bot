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

  const hideBack = pathname?.startsWith("/admin/dashboard");

  return (
    <div className="admin-header grid grid-cols-[auto,1fr,auto] items-center h-14 px-4 border-b border-zinc-800">
      <button
        data-testid="back"
        onClick={goBack}
        disabled={hideBack}
        className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 hover:text-white disabled:opacity-50"
        aria-label="Back"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {actionsRight}
        {showClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}





