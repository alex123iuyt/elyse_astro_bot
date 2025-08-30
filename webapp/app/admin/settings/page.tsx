"use client";

import { useState, useEffect } from 'react';
import { 
  CogIcon, GlobeAltIcon, UserGroupIcon, 
  KeyIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface Settings {
  locales: string[];
  defaultLocale: string;
  timezone: string;
  aiModel: string;
  aiTemperature: number;
  autoPublish: boolean;
  requireReview: boolean;
  roles: Array<{
    name: string;
    permissions: string[];
  }>;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        alert('Настройки сохранены');
      } else {
        alert('Ошибка при сохранении');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
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

  if (!settings) {
    return (
      <div className="p-6">
        <p className="text-red-400">Ошибка загрузки настроек</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Настройки</h1>
          <p className="text-zinc-400">Конфигурация системы и параметры</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-600 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <CogIcon className="w-4 h-4" />
          <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
        </button>
      </div>

      {/* Locale & Timezone */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <div className="flex items-center space-x-3 mb-4">
          <GlobeAltIcon className="w-6 h-6 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Локализация</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Доступные языки
            </label>
            <div className="space-y-2">
              {settings.locales.map((locale) => (
                <label key={locale} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.locales.includes(locale)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettings({...settings, locales: [...settings.locales, locale]});
                      } else {
                        setSettings({...settings, locales: settings.locales.filter(l => l !== locale)});
                      }
                    }}
                    className="rounded border-zinc-600 bg-zinc-800 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-white">{locale}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Язык по умолчанию
            </label>
            <select
              value={settings.defaultLocale}
              onChange={(e) => setSettings({...settings, defaultLocale: e.target.value})}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {settings.locales.map((locale) => (
                <option key={locale} value={locale}>{locale}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Часовой пояс по умолчанию
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({...settings, timezone: e.target.value})}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
            <option value="Europe/London">Europe/London (UTC+0)</option>
            <option value="America/New_York">America/New_York (UTC-5)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
          </select>
        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <div className="flex items-center space-x-3 mb-4">
          <KeyIcon className="w-6 h-6 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Настройки AI</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Модель AI
            </label>
            <select
              value={settings.aiModel}
              onChange={(e) => setSettings({...settings, aiModel: e.target.value})}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3">Claude-3</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Температура (креативность): {settings.aiTemperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.aiTemperature}
              onChange={(e) => setSettings({...settings, aiTemperature: parseFloat(e.target.value)})}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>Консервативно</span>
              <span>Сбалансированно</span>
              <span>Креативно</span>
            </div>
          </div>
        </div>
      </div>

      {/* Publishing Rules */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <div className="flex items-center space-x-3 mb-4">
          <ShieldCheckIcon className="w-6 h-6 text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">Правила публикации</h2>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.autoPublish}
              onChange={(e) => setSettings({...settings, autoPublish: e.target.checked})}
              className="rounded border-zinc-600 bg-zinc-800 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-white">Автоматически публиковать после генерации</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.requireReview}
              onChange={(e) => setSettings({...settings, requireReview: e.target.checked})}
              className="rounded border-zinc-600 bg-zinc-800 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-white">Требовать ревью перед публикацией</span>
          </label>
        </div>
      </div>

      {/* Roles & Permissions */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <div className="flex items-center space-x-3 mb-4">
          <UserGroupIcon className="w-6 h-6 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Роли и права доступа</h2>
        </div>
        
        <div className="space-y-4">
          {settings.roles.map((role) => (
            <div key={role.name} className="p-4 bg-zinc-800 rounded-lg">
              <h3 className="text-md font-medium text-white mb-2">{role.name}</h3>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-2 py-1 text-xs bg-emerald-600 text-white rounded-full"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}





