"use client";

import Header from '../../components/Header'

import { useUser } from '../../store/user'
import { useAuth } from '../../contexts/AuthContext'
import { PrivateContent } from '../../components/AuthContentGate'

export default function HumanDesignPage() {
  const { profile } = useUser()
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        name={isAuthenticated ? (user?.name || profile.name) : "Гость"} 
        tags={isAuthenticated ? ["☉ Virgo", "↑ Libra", "☾ Scorpio"] : ["🌟 Общие прогнозы"]}
        onOpenPremium={() => window.location.href = "/profile"}
      />
      
      <PrivateContent
        title="Дизайн Человека"
        description="Войдите в аккаунт, чтобы получить персональную карту Дизайна Человека и узнать свой тип"
      >
        <div className="p-4 space-y-6 pb-24">
        <h1 className="text-2xl font-serif">Human Design</h1>
        
        <div className="card">
          <div className="text-xl font-semibold mb-3">Your Design Type</div>
          <div className="opacity-80 mb-4">
            Human Design combines ancient wisdom with modern science to reveal your unique energy type 
            and how you're designed to interact with the world.
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="opacity-70">Birth Date:</span>
              <span>{profile.birthDate || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Birth Time:</span>
              <span>{profile.birthTime || '—'}</span>
            </div>
          </div>
          
          <button className="btn w-full mt-4">Calculate Design</button>
        </div>
        
        <div className="card">
          <div className="text-lg font-semibold mb-2">Energy Centers</div>
          <div className="opacity-80 text-sm">
            Your bodygraph shows which energy centers are defined (colored) and which are open (white), 
            revealing your unique gifts and challenges.
          </div>
        </div>
        
        <div className="card">
          <div className="text-lg font-semibold mb-2">Strategy & Authority</div>
          <div className="opacity-80 text-sm">
            Learn your decision-making strategy and inner authority to make choices that align with your true nature.
          </div>
        </div>
        </div>
      </PrivateContent>
    </div>
  )
}


