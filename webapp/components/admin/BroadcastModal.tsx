"use client";

import BroadcastCreate from './BroadcastCreate';

export default function BroadcastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-zinc-950 w-full max-w-5xl rounded-2xl border border-zinc-800 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="text-xl font-semibold">Создать новую рассылку</div>
          <button onClick={onClose} className="px-3 py-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">✕</button>
        </div>
        <div className="p-6">
          <BroadcastCreate onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}









