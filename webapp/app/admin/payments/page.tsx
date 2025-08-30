"use client";
import { useState, useEffect } from 'react';
import { AdminHeader } from '../../../components/admin/AdminHeader';
import Loader from '../../../components/ui/Loader';

interface PaymentSettings {
  tbank: {
    enabled: boolean;
    merchantId: string;
    secretKey: string;
    testMode: boolean;
    webhookUrl: string;
  };
  general: {
    currency: string;
    autoRenewal: boolean;
    gracePeriod: number;
    refundPolicy: string;
  };
}

export default function PaymentsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    tbank: {
      enabled: false,
      merchantId: '',
      secretKey: '',
      testMode: true,
      webhookUrl: ''
    },
    general: {
      currency: 'RUB',
      autoRenewal: true,
      gracePeriod: 3,
      refundPolicy: '7 дней'
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  // Загрузка настроек при монтировании
  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/payment-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        alert('Настройки сохранены успешно!');
      } else {
        throw new Error('Ошибка сохранения');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка сохранения настроек');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/payment-settings/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings.tbank)
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Соединение с Т-Банком успешно установлено!');
      } else {
        throw new Error('Ошибка соединения');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      alert('Ошибка соединения с Т-Банком');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <Loader size="lg" text="Загружаем настройки..." fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <AdminHeader title="Настройки эквайринга" backFallback="/admin/dashboard" />
      
      <div className="p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Платежи и эквайринг</h1>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <Loader size="sm" />
                <span>Сохранение...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Сохранить</span>
              </>
            )}
          </button>
        </div>

        {/* T-Bank Settings */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <span>🏦</span>
              <span>Т-Банк эквайринг</span>
            </h2>
            <button
              onClick={handleTestConnection}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              {isLoading ? 'Тестирование...' : 'Тест соединения'}
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
              <div>
                <h3 className="font-medium">Активировать эквайринг</h3>
                <p className="text-sm text-zinc-400">Включить прием платежей через Т-Банк</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.tbank.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    tbank: { ...prev.tbank, enabled: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Test Mode */}
            <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
              <div>
                <h3 className="font-medium">Тестовый режим</h3>
                <p className="text-sm text-zinc-400">Использовать тестовую среду для разработки</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.tbank.testMode}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    tbank: { ...prev.tbank, testMode: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Merchant ID */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Merchant ID</label>
              <input
                type="text"
                value={settings.tbank.merchantId}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  tbank: { ...prev.tbank, merchantId: e.target.value }
                }))}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите ваш Merchant ID"
              />
            </div>

            {/* Secret Key */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Секретный ключ</label>
              <div className="relative">
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  value={settings.tbank.secretKey}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    tbank: { ...prev.tbank, secretKey: e.target.value }
                  }))}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 pr-12 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Введите секретный ключ"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showSecretKey ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Webhook URL */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Webhook URL</label>
              <input
                type="text"
                value={settings.tbank.webhookUrl}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  tbank: { ...prev.tbank, webhookUrl: e.target.value }
                }))}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="URL для получения уведомлений о платежах"
              />
            </div>
          </div>
        </div>

        {/* General Payment Settings */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Общие настройки</h2>
          
          <div className="space-y-4">
            {/* Currency */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Валюта</label>
              <select
                value={settings.general.currency}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, currency: e.target.value }
                }))}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="RUB">Российский рубль (₽)</option>
                <option value="USD">Доллар США ($)</option>
                <option value="EUR">Евро (€)</option>
              </select>
            </div>

            {/* Auto Renewal */}
            <div className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
              <div>
                <h3 className="font-medium">Автопродление</h3>
                <p className="text-sm text-zinc-400">Автоматически продлевать подписки</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.general.autoRenewal}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, autoRenewal: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Grace Period */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Льготный период (дни)</label>
              <input
                type="number"
                value={settings.general.gracePeriod}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, gracePeriod: parseInt(e.target.value) || 0 }
                }))}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Количество дней льготного периода"
                min="0"
                max="30"
              />
            </div>

            {/* Refund Policy */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Политика возвратов</label>
              <select
                value={settings.general.refundPolicy}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  general: { ...prev.general, refundPolicy: e.target.value }
                }))}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7 дней">7 дней</option>
                <option value="14 дней">14 дней</option>
                <option value="30 дней">30 дней</option>
                <option value="Без возвратов">Без возвратов</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Statistics */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Статистика платежей</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Успешные платежи</h3>
              <p className="text-3xl font-bold text-emerald-400">-</p>
              <p className="text-sm text-zinc-400">Данные загружаются</p>
            </div>
            <div className="bg-zinc-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Среднее время обработки</h3>
              <p className="text-3xl font-bold text-blue-400">-</p>
              <p className="text-sm text-zinc-400">Данные загружаются</p>
            </div>
            <div className="bg-zinc-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Возвраты</h3>
              <p className="text-3xl font-bold text-orange-400">-</p>
              <p className="text-sm text-zinc-400">Данные загружаются</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
