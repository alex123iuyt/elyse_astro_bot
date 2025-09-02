"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import BroadcastHistory from '@/components/admin/BroadcastHistory';
import BroadcastModal from '@/components/admin/BroadcastModal';

function toast(message: string, type: 'success'|'error'|'info' = 'info') {
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type }}));
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Рассылки</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          ✉️ Создать рассылку
        </button>
      </div>

      <div className="p-4">
        <BroadcastHistory />
      </div>

      {/* Модальное окно создания рассылки */}
      <BroadcastModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}


