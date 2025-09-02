"use client";

import Header from '../../../components/Header'
import { useUser } from '../../../store/user'

export default function EditProfilePage() {
  const { profile } = useUser();

  return (
    <>
      <Header 
        name={profile.name} 
        tags={["☉ Virgo", "↑ Libra", "☾ Scorpio"]}
        onOpenPremium={() => window.location.href = "/profile"}
      />
      <div className="py-4 space-y-6 page-has-bottom-nav">
        <div className="text-center py-8">
          <div className="text-2xl font-semibold text-white mb-2">Edit Profile</div>
          <div className="text-zinc-400">Profile editing screen coming soon...</div>
        </div>
      </div>
    </>
  );
}















