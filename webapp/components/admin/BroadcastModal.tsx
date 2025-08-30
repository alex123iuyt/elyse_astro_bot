"use client";

export default function BroadcastModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center">
      <div className="bg-zinc-950 w-full max-w-3xl rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-zinc-800">
          <div className="font-semibold">Новая рассылка</div>
          <button onClick={onClose} className="px-2 py-1 hover:bg-zinc-800 rounded">✕</button>
        </div>
        <iframe src="/admin/notifications" className="w-full h-[640px]"></iframe>
      </div>
    </div>
  );
}







