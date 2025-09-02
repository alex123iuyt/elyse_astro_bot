"use client";

import { useState, useEffect } from 'react';
import {
  UsersIcon, UserPlusIcon, ChartBarIcon, DocumentTextIcon,
  ExclamationTriangleIcon, CheckCircleIcon, ClockIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  users: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  registrations: {
    today: number;
    week: number;
    month: number;
    conversion: number;
  };
  content: {
    dailyForecast: { generated: number; total: number; status: 'ok' | 'warning' | 'error' };
    dailyTips: { generated: number; total: number; status: 'ok' | 'warning' | 'error' };
    lunar: { generated: number; total: number; status: 'ok' | 'warning' | 'error' };
    compatibility: { generated: number; total: number; status: 'ok' | 'warning' | 'error' };
  };
  jobs: {
    inProgress: number;
    errors: number;
    completed: number;
  };
  errors: {
    last24h: number;
    critical: number;
  };
}

interface ZodiacDistribution {
  sign: string;
  count: number;
  percentage: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [zodiacDistribution, setZodiacDistribution] = useState<ZodiacDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      // Загружаем данные дашборда
      const [statsRes, zodiacRes] = await Promise.all([
        fetch('/api/admin/stats/overview?range=30d'),
        fetch('/api/admin/stats/zodiac-distribution')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (zodiacRes.ok) {
        const zodiacData = await zodiacRes.json();
        setZodiacDistribution(zodiacData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok': return 'text-emerald-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok': return <CheckCircleIcon className="w-5 h-5 text-emerald-400" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'error': return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      default: return <ClockIcon className="w-5 h-5 text-zinc-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-zinc-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Дашборд</h1>
          <p className="text-zinc-400">Обзор системы и метрик</p>
        </div>
        <div className="h-9" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Активные пользователи</p>
              <p className="text-2xl font-bold text-white">{stats?.users.total || 0}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Сегодня</span>
              <span className="text-white">{stats?.users.today || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">7 дней</span>
              <span className="text-white">{stats?.users.week || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">30 дней</span>
              <span className="text-white">{stats?.users.month || 0}</span>
            </div>
          </div>
        </div>

        {/* Registrations */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Регистрации</p>
              <p className="text-2xl font-bold text-white">{stats?.registrations.month || 0}</p>
            </div>
            <UserPlusIcon className="w-8 h-8 text-blue-400" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Сегодня</span>
              <span className="text-white">{stats?.registrations.today || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Конверсия</span>
              <span className="text-white">{stats?.registrations.conversion || 0}%</span>
            </div>
          </div>
        </div>

        {/* Jobs */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Задачи</p>
              <p className="text-2xl font-bold text-white">{stats?.jobs.completed || 0}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">В работе</span>
              <span className="text-white">{stats?.jobs.inProgress || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Ошибки</span>
              <span className="text-red-400">{stats?.jobs.errors || 0}</span>
            </div>
          </div>
        </div>

        {/* Errors */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Ошибки (24ч)</p>
              <p className="text-2xl font-bold text-white">{stats?.errors.last24h || 0}</p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Критические</span>
              <span className="text-red-400">{stats?.errors.critical || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Status */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-4">Готовность контента на сегодня</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats && Object.entries(stats.content).map(([key, content]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(content.status)}
                <div>
                  <p className="text-sm font-medium text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {content.generated}/{content.total}
                  </p>
                </div>
              </div>
              <button className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors">
                Генерировать
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Zodiac Distribution */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-4">Распределение по знакам</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {zodiacDistribution.map((item) => (
            <div key={item.sign} className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {item.sign}
              </div>
              <p className="text-sm text-white font-medium">{item.count}</p>
              <p className="text-xs text-zinc-400">{item.percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-4">Быстрые действия</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
            Генерировать контент на сегодня
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Копировать вчерашний контент
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            Отправить push-уведомления
          </button>
          <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
            Проверить интеграции
          </button>
        </div>
      </div>
    </div>
  );
}
