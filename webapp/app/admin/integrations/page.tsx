"use client";

import { useState, useEffect } from 'react';
import { 
  PuzzlePieceIcon, KeyIcon, GlobeAltIcon, 
  CloudIcon, CheckCircleIcon, XCircleIcon
} from '@heroicons/react/24/outline';

interface Integration {
  id: string;
  name: string;
  type: 'LLM' | 'LUNAR' | 'ANALYTICS' | 'PAYMENTS' | 'STORAGE';
  provider: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  config: Record<string, any>;
  lastTest?: string;
  testResult?: 'SUCCESS' | 'FAILURE';
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      // Пока используем mock данные, показывающие доступные интеграции
      const mockIntegrations: Integration[] = [
        {
          id: 'groq',
          name: 'Groq AI',
          type: 'LLM',
          provider: 'Groq Inc.',
          status: 'ACTIVE',
          config: {
            apiKey: process.env.GROQ_API_KEY ? 'Настроен' : 'Не настроен',
            model: 'llama3-8b-8192',
            maxTokens: 1024,
            temperature: 0.7
          },
          lastTest: new Date().toISOString(),
          testResult: process.env.GROQ_API_KEY ? 'SUCCESS' : 'FAILURE'
        },
        {
          id: 'openai',
          name: 'OpenAI GPT',
          type: 'LLM',
          provider: 'OpenAI',
          status: process.env.OPENAI_API_KEY ? 'ACTIVE' : 'INACTIVE',
          config: {
            apiKey: process.env.OPENAI_API_KEY ? 'Настроен' : 'Не настроен',
            model: 'gpt-4o-mini',
            maxTokens: 1000
          },
          lastTest: new Date().toISOString(),
          testResult: process.env.OPENAI_API_KEY ? 'SUCCESS' : 'FAILURE'
        },
        {
          id: 'together',
          name: 'Together AI',
          type: 'LLM',
          provider: 'Together AI',
          status: process.env.TOGETHER_API_KEY ? 'ACTIVE' : 'INACTIVE',
          config: {
            apiKey: process.env.TOGETHER_API_KEY ? 'Настроен' : 'Не настроен',
            model: 'meta-llama/Llama-3-8b-chat-hf'
          }
        },
        {
          id: 'huggingface',
          name: 'Hugging Face',
          type: 'LLM',
          provider: 'Hugging Face',
          status: process.env.HUGGINGFACE_API_KEY ? 'ACTIVE' : 'INACTIVE',
          config: {
            apiKey: process.env.HUGGINGFACE_API_KEY ? 'Настроен' : 'Не настроен',
            model: 'microsoft/DialoGPT-medium'
          }
        }
      ];
      
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testIntegration = async (integrationId: string) => {
    try {
      setTestingId(integrationId);
      const response = await fetch(`/api/admin/integrations/${integrationId}/test`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Интеграция работает корректно');
        } else {
          alert(`Ошибка: ${result.error}`);
        }
        loadIntegrations(); // Обновляем статус
      } else {
        alert('Ошибка при тестировании');
      }
    } catch (error) {
      console.error('Error testing integration:', error);
      alert('Ошибка при тестировании');
    } finally {
      setTestingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: 'bg-emerald-600 text-white',
      INACTIVE: 'bg-zinc-600 text-white',
      ERROR: 'bg-red-600 text-white'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[status as keyof typeof badges] || badges.INACTIVE}`}>
        {status === 'ACTIVE' ? 'Активна' :
         status === 'INACTIVE' ? 'Неактивна' : 'Ошибка'}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      LLM: KeyIcon,
      LUNAR: GlobeAltIcon,
      ANALYTICS: CloudIcon,
      PAYMENTS: CloudIcon,
      STORAGE: CloudIcon
    };
    
    const Icon = icons[type as keyof typeof icons] || PuzzlePieceIcon;
    return <Icon className="w-6 h-6" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      LLM: 'text-blue-400',
      LUNAR: 'text-emerald-400',
      ANALYTICS: 'text-purple-400',
      PAYMENTS: 'text-yellow-400',
      STORAGE: 'text-orange-400'
    };
    
    return colors[type as keyof typeof colors] || 'text-zinc-400';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
          <div className="h-64 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Интеграции</h1>
          <p className="text-zinc-400">Управление внешними сервисами и API</p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`${getTypeColor(integration.type)}`}>
                  {getTypeIcon(integration.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                  <p className="text-sm text-zinc-400">{integration.provider}</p>
                </div>
              </div>
              {getStatusBadge(integration.status)}
            </div>

            {/* Configuration Preview */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-zinc-300 mb-2">Конфигурация</h4>
              <div className="space-y-1">
                {Object.entries(integration.config).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-zinc-400">{key}:</span>
                    <span className="text-white">
                      {key.toLowerCase().includes('key') ? '••••••••' : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Test Result */}
            {integration.lastTest && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-zinc-300 mb-2">Последний тест</h4>
                <div className="flex items-center space-x-2">
                  {integration.testResult === 'SUCCESS' ? (
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                  ) : integration.testResult === 'FAILURE' ? (
                    <XCircleIcon className="w-4 h-4 text-red-400" />
                  ) : null}
                  <span className="text-xs text-zinc-400">
                    {new Date(integration.lastTest).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => testIntegration(integration.id)}
                disabled={testingId === integration.id}
                className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-600 text-white text-sm rounded transition-colors"
              >
                {testingId === integration.id ? 'Тестирование...' : 'Проверить'}
              </button>
              <button className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors">
                Настроить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Types Info */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-4">Типы интеграций</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium text-white mb-2">LLM Провайдер</h3>
            <p className="text-sm text-zinc-400 mb-2">
              OpenAI, Claude или совместимые API для генерации контента
            </p>
            <div className="text-xs text-zinc-500">
              • API ключ • Модель • Лимиты • Лог запросов
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-white mb-2">Лунные данные</h3>
            <p className="text-sm text-zinc-400 mb-2">
              Источник эфемерид для расчета фаз Луны и астрологических данных
            </p>
            <div className="text-xs text-zinc-500">
              • LocalCalc (по умолчанию) • External API • Swiss Ephemeris
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-white mb-2">Аналитика</h3>
            <p className="text-sm text-zinc-400 mb-2">
              Отслеживание событий и метрик пользователей
            </p>
            <div className="text-xs text-zinc-500">
              • Google Analytics • Mixpanel • Amplitude
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-white mb-2">Платежи</h3>
            <p className="text-sm text-zinc-400 mb-2">
              Обработка подписок и премиум-функций
            </p>
            <div className="text-xs text-zinc-500">
              • Stripe • PayPal • ЮKassa
            </div>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-4">Инструкции по настройке</h2>
        <div className="space-y-4 text-sm text-zinc-400">
          <div>
            <h3 className="text-white font-medium mb-1">1. LLM Провайдер</h3>
            <p>Получите API ключ от OpenAI, Anthropic или другого провайдера. Добавьте ключ в настройки и выберите модель.</p>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-1">2. Лунные данные</h3>
            <p>По умолчанию используется локальный калькулятор. Для более точных данных настройте внешний API эфемерид.</p>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-1">3. Аналитика</h3>
            <p>Подключите сервис аналитики для отслеживания поведения пользователей и эффективности контента.</p>
          </div>
          
          <div>
            <h3 className="text-white font-medium mb-1">4. Тестирование</h3>
            <p>После настройки используйте кнопку "Проверить" для тестирования интеграции.</p>
          </div>
        </div>
      </div>

      {/* Lunar provider setup guide */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-3">Лунные данные — провайдер</h2>
        <p className="text-sm text-zinc-300 mb-2">Два режима: LocalCalc (по умолчанию) и External.</p>
        <ol className="list-decimal pl-5 space-y-1 text-sm text-zinc-300">
          <li>По умолчанию используется LocalCalc. Ничего настраивать не нужно.</li>
          <li>Чтобы включить внешний провайдер, задайте переменные окружения:
            <pre className="mt-2 p-3 bg-zinc-800 rounded text-xs">{`LUNAR_PROVIDER=external
LUNAR_API_URL=https://your-external-lunar-service
LUNAR_API_KEY=xxxxxxxx`}</pre>
          </li>
          <li>Нажмите «Проверить интеграцию». При успехе сохраните настройки.</li>
          <li>При ошибке система должна автоматически вернуться к LocalCalc.</li>
        </ol>
      </div>
    </div>
  );
}
