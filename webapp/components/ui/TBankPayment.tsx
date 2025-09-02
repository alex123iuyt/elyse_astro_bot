"use client";

import { useState } from 'react';
import Loader from './Loader';

interface TBankPaymentProps {
  amount: number;
  planName: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export default function TBankPayment({ amount, planName, onSuccess, onError, onCancel }: TBankPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Здесь будет API вызов для создания платежа в Т-Банке
      const response = await fetch('/api/payment/tbank/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          planName,
          currency: 'RUB',
          description: `Подписка на ${planName}`,
          returnUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка создания платежа');
      }

      const data = await response.json();
      
      if (data.paymentUrl) {
        setPaymentUrl(data.paymentUrl);
        // Перенаправляем на страницу оплаты Т-Банка
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Не получен URL для оплаты');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Ошибка создания платежа');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader size="lg" text="Создаем платеж..." />
        <p className="text-zinc-400 text-center">
          Перенаправляем на страницу оплаты Т-Банка...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 rounded-xl p-6 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🏦</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Оплата через Т-Банк</h3>
        <p className="text-zinc-400">
          Безопасная оплата через эквайринг Т-Банка
        </p>
      </div>

      <div className="bg-zinc-700 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-zinc-400">Тариф:</span>
          <span className="font-medium">{planName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Сумма:</span>
          <span className="text-xl font-bold text-emerald-400">
            ₽{amount.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <span>💳</span>
          <span>Оплатить через Т-Банк</span>
        </button>
        
        <button
          onClick={onCancel}
          className="w-full bg-zinc-600 hover:bg-zinc-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          Отмена
        </button>
      </div>

      <div className="text-xs text-zinc-500 text-center space-y-1">
        <p>Оплата производится через защищенное соединение</p>
        <p>После оплаты вы будете перенаправлены обратно в приложение</p>
      </div>
    </div>
  );
}




