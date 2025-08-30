"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TBankPayment from '../../components/ui/TBankPayment';
import Loader from '../../components/ui/Loader';

interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  pricePerWeek: number;
  savings?: number;
  isPopular: boolean;
  isActive: boolean;
  features: string[];
}

interface PromoVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
  showOnMainPage: boolean;
  autoPlay: boolean;
  showOnMobile: boolean;
}

export default function PremiumPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [promoVideo, setPromoVideo] = useState<PromoVideo | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadSubscriptionPlans();
    loadPromoVideo();
  }, []);

  const loadSubscriptionPlans = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions');
      if (response.ok) {
        const data = await response.json();
        const activePlans = data.plans?.filter((plan: SubscriptionPlan) => plan.isActive) || [];
        setPlans(activePlans);
        
        // Устанавливаем первый активный план как выбранный
        if (activePlans.length > 0 && !selectedPlan) {
          setSelectedPlan(activePlans[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    }
  };

  const loadPromoVideo = async () => {
    try {
      const response = await fetch('/api/admin/promo-video');
      if (response.ok) {
        const data = await response.json();
        setPromoVideo(data.promoVideo);
      }
    } catch (error) {
      console.error('Error loading promo video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedPlan) {
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    // Здесь можно добавить логику активации подписки
    router.push('/payment/success');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert(`Ошибка платежа: ${error}`);
    setShowPayment(false);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader size="lg" text="Загружаем тарифы..." fullScreen />
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader size="lg" text="Обрабатываем ваш запрос..." fullScreen />
      </div>
    );
  }

  if (showPayment && selectedPlanData) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowPayment(false)}
              className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"
            >
              ←
            </button>
            <h1 className="text-xl font-semibold">Оплата</h1>
            <div className="w-8 h-8"></div>
          </div>
        </div>

        {/* Payment Component */}
        <div className="p-4">
          <TBankPayment
            amount={selectedPlanData.price}
            planName={selectedPlanData.name}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"
          >
            ←
          </button>
          <h1 className="text-xl font-semibold">Подписка</h1>
          <div className="w-8 h-8"></div>
        </div>
      </div>

      {/* Promo Video Section */}
      {promoVideo && promoVideo.showOnMainPage && (
        <div className="p-4">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-4">🎬</div>
            <h2 className="text-2xl font-bold mb-2">{promoVideo.title}</h2>
            <p className="text-zinc-300 mb-4">{promoVideo.description}</p>
            
            {/* Video Placeholder */}
            <div className="bg-zinc-800 rounded-xl p-8 mb-4">
              <div className="text-6xl mb-2">▶️</div>
              <p className="text-zinc-400">Видео: {promoVideo.title}</p>
            </div>
            
            <button 
              onClick={() => window.open(promoVideo.videoUrl, '_blank')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Смотреть видео
            </button>
          </div>
        </div>
      )}

      {/* Compatibility Section */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Совместимость</h2>
          
          {/* Zodiac Signs */}
          <div className="flex items-center justify-center space-x-8 mb-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500/30 rounded-full flex items-center justify-center mb-2">
                <span className="text-3xl">♌</span>
              </div>
              <p className="text-sm">Лев</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">75%</div>
              <div className="w-16 h-2 bg-emerald-500/30 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-emerald-500"></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-500/30 rounded-full flex items-center justify-center mb-2">
                <span className="text-3xl">♐</span>
              </div>
              <p className="text-sm">Стрелец</p>
            </div>
          </div>
          
          <p className="text-lg font-medium">Получите персональный прогноз</p>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="p-4">
        {plans.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <p>Тарифы не найдены</p>
            <p className="text-sm">Обратитесь к администратору</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedPlan === plan.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      {plan.savings && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Экономия {plan.savings}%
                        </span>
                      )}
                      {plan.isPopular && (
                        <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                          Популярно
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">₽{plan.price.toLocaleString()}</p>
                    <p className="text-sm text-zinc-400">₽{plan.pricePerWeek.toFixed(2)}/неделя</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {selectedPlan === plan.id ? (
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-zinc-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Continue Button */}
      {plans.length > 0 && (
        <div className="p-4">
          <button
            onClick={handleContinue}
            disabled={!selectedPlan}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white py-4 rounded-xl font-bold text-lg transition-colors"
          >
            {selectedPlan ? 'ПРОДОЛЖИТЬ' : 'ВЫБЕРИТЕ ТАРИФ'}
          </button>
        </div>
      )}

      {/* Footer Links */}
      <div className="p-4 text-center space-y-2">
        <div className="flex justify-center space-x-6 text-sm">
          <a href="#" className="text-emerald-400 hover:text-emerald-300">Политика конфиденциальности</a>
          <a href="#" className="text-emerald-400 hover:text-emerald-300">Восстановить</a>
          <a href="#" className="text-emerald-400 hover:text-emerald-300">Условия использования</a>
        </div>
      </div>
    </div>
  );
}








