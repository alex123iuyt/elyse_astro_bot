"use client";

import { useRouter } from 'next/navigation';

type ProfileData = {
  name: string;
  [key: string]: any;
}

type ClientHeaderProps = {
  profileData: ProfileData;
}

export default function ClientHeader({ profileData }: ClientHeaderProps) {
  const router = useRouter();

  const handleOpenSettings = () => {
    router.push('/profile');
  };

  const handleOpenPremium = () => {
    router.push('/premium');
  };

  return (
    <header className="sticky top-0 z-50 bg-zinc-900/95 border-b border-zinc-800 backdrop-blur-sm">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <button
              className="text-2xl font-serif text-white hover:opacity-90 transition-opacity cursor-pointer"
              onClick={() => router.push('/profile')}
              aria-label="Open profile"
            >
              {profileData.name || 'Гость'}
            </button>
            <div className="mt-2 text-sm text-zinc-400 flex items-center gap-3">
              <span>☉ {profileData.sunSign || 'Неизвестно'}</span>
              <span>↑ {profileData.ascendant || 'Неизвестно'}</span>
              <span>☾ {profileData.moonSign || 'Неизвестно'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              aria-label="Settings"
              onClick={handleOpenSettings}
              className="h-9 w-9 grid place-items-center rounded-full hover:bg-white/10 transition-colors text-white"
            >
              ⚙️
            </button>
            <button
              aria-label="Premium"
              onClick={handleOpenPremium}
              className="h-9 w-9 grid place-items-center rounded-full hover:bg-white/10 transition-colors text-white"
            >
              💎
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}











