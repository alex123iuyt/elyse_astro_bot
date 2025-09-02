"use client";

import PageWithAuth from '../../components/PageWithAuth';

export default function TarotPage() {
  return (
    <PageWithAuth
      title="Расклады Таро"
      description="Войдите в аккаунт, чтобы получить персональные расклады Таро и гадания на картах"
    >
      <div className="p-4 space-y-6 pb-24">
        <h1 className="text-2xl font-serif">Tarot Readings</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="card text-center p-6">
            <div className="text-4xl mb-3">🃏</div>
            <div className="text-lg font-semibold mb-2">Card of the day</div>
            <div className="text-sm opacity-70 mb-4">Daily guidance from the cards</div>
            <button className="btn w-full">Read</button>
          </div>
          
          <div className="card text-center p-6">
            <div className="text-4xl mb-3">🔮</div>
            <div className="text-lg font-semibold mb-2">Near future</div>
            <div className="text-sm opacity-70 mb-4">What's coming next</div>
            <button className="btn w-full">Read</button>
          </div>
          
          <div className="card text-center p-6">
            <div className="text-4xl mb-3">💕</div>
            <div className="text-lg font-semibold mb-2">Love and relationships</div>
            <div className="text-sm opacity-70 mb-4">Insights about your heart</div>
            <button className="btn w-full">Read</button>
          </div>
          
          <div className="card text-center p-6">
            <div className="text-4xl mb-3">❓</div>
            <div className="text-lg font-semibold mb-2">Yes or no</div>
            <div className="text-sm opacity-70 mb-4">Quick answers to your questions</div>
            <button className="btn w-full">Ask</button>
          </div>
        </div>
      </div>
    </PageWithAuth>
  );
}


