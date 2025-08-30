"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Loader from '../../../../components/ui/Loader';

export default function TBankProcessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Обрабатываем платеж...');

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');

    if (status === 'success') {
      setStatus('success');
      setMessage('Платеж успешно обработан!');
      
      // Перенаправляем на страницу успеха через 2 секунды
      setTimeout(() => {
        router.push('/payment/success');
      }, 2000);
    } else if (status === 'error') {
      setStatus('error');
      setMessage('Ошибка при обработке платежа');
      
      // Перенаправляем на страницу ошибки через 2 секунды
      setTimeout(() => {
        router.push('/payment/error');
      }, 2000);
    } else {
      // Имитируем обработку платежа
      setTimeout(() => {
        setStatus('success');
        setMessage('Платеж успешно обработан!');
        
        setTimeout(() => {
          router.push('/payment/success');
        }, 2000);
      }, 3000);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          {status === 'processing' && (
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader size="lg" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">❌</span>
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold mb-4">
          {status === 'processing' ? 'Обработка платежа' :
           status === 'success' ? 'Платеж успешен' : 'Ошибка платежа'}
        </h1>
        
        <p className="text-zinc-400 mb-6">{message}</p>
        
        {status === 'processing' && (
          <div className="text-sm text-zinc-500">
            Пожалуйста, не закрывайте страницу...
          </div>
        )}
      </div>
    </div>
  );
}
