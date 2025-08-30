"use client";

import { useState } from 'react'
import Link from 'next/link'

export default function Settings() {
  const [notifications, setNotifications] = useState(true)
  const [dailyHoroscope, setDailyHoroscope] = useState(true)
  const [weeklyForecast, setWeeklyForecast] = useState(false)
  
  return (
    <div className="py-4 space-y-4 page-has-bottom-nav">
      {/* Profile Section */}
      <section className="card">
        <h2 className="font-semibold mb-4 text-lg">Profile</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold">
              A
            </div>
            <div>
              <div className="font-medium">Antin</div>
              <div className="text-sm opacity-70">Virgo • Libra • Scorpio</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="opacity-70">Birth Date</div>
              <div>September 15, 1990</div>
            </div>
            <div>
              <div className="opacity-70">Birth Time</div>
              <div>14:30</div>
            </div>
            <div>
              <div className="opacity-70">Birth Place</div>
              <div>Moscow, Russia</div>
            </div>
            <div>
              <div className="opacity-70">Timezone</div>
              <div>Europe/Moscow</div>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="card">
        <h2 className="font-semibold mb-4 text-lg">Notifications</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm opacity-70">Receive daily horoscopes</div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors ${
                notifications ? 'bg-emerald-500' : 'bg-zinc-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                notifications ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Daily Horoscope</div>
              <div className="text-sm opacity-70">Every morning at 9:00</div>
            </div>
            <button
              onClick={() => setDailyHoroscope(!dailyHoroscope)}
              className={`w-12 h-6 rounded-full transition-colors ${
                dailyHoroscope ? 'bg-emerald-500' : 'bg-zinc-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                dailyHoroscope ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Weekly Forecast</div>
              <div className="text-sm opacity-70">Every Monday at 10:00</div>
            </div>
            <button
              onClick={() => setWeeklyForecast(!weeklyForecast)}
              className={`w-12 h-6 rounded-full transition-colors ${
                weeklyForecast ? 'bg-emerald-500' : 'bg-zinc-600'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                weeklyForecast ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="card">
        <h2 className="font-semibold mb-4 text-lg">Preferences</h2>
        <div className="space-y-3">
          <Link href="/onboarding" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div>
              <div className="font-medium">Edit Birth Data</div>
              <div className="text-sm opacity-70">Update your astrological profile</div>
            </div>
            <span className="text-lg">→</span>
          </Link>
          
          <Link href="/compat" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div>
              <div className="font-medium">Compatibility</div>
              <div className="text-sm opacity-70">Check relationship compatibility</div>
            </div>
            <span className="text-lg">→</span>
          </Link>
          
          <Link href="/natal" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
            <div>
              <div className="font-medium">Natal Chart</div>
              <div className="text-sm opacity-70">View your birth chart</div>
            </div>
            <span className="text-lg">→</span>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="card">
        <h2 className="font-semibold mb-4 text-lg">About</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="opacity-70">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Build</span>
            <span>2024.08.14</span>
          </div>
          <div className="pt-3 space-y-2">
            <Link href="/privacy" className="block text-emerald-400 hover:text-emerald-300">Privacy Policy</Link>
            <Link href="/terms" className="block text-emerald-400 hover:text-emerald-300">Terms of Service</Link>
            <Link href="/support" className="block text-emerald-400 hover:text-emerald-300">Support</Link>
          </div>
        </div>
      </section>
    </div>
  )
}



