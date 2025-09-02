"use client";

import { useState, useEffect } from 'react';
import { 
  MegaphoneIcon, PaperAirplaneIcon, ChartBarIcon,
  EyeIcon, PencilIcon, TrashIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  type: 'PUSH' | 'EMAIL' | 'SMS';
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'PAUSED';
  audience: 'ALL' | 'SIGN' | 'PREMIUM' | 'CUSTOM';
  targetSign?: string;
  message: string;
  scheduledAt?: string;
  sentAt?: string;
  sent: number;
  delivered: number;
  opened: number;
  errors: number;
}

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/marketing/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: 'bg-zinc-600 text-white',
      SCHEDULED: 'bg-yellow-600 text-white',
      SENT: 'bg-emerald-600 text-white',
      PAUSED: 'bg-red-600 text-white'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[status as keyof typeof badges] || badges.DRAFT}`}>
        {status === 'DRAFT' ? 'Черновик' :
         status === 'SCHEDULED' ? 'Запланировано' :
         status === 'SENT' ? 'Отправлено' : 'Приостановлено'}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      PUSH: 'bg-blue-600 text-white',
      EMAIL: 'bg-green-600 text-white',
      SMS: 'bg-purple-600 text-white'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[type as keyof typeof badges] || badges.PUSH}`}>
        {type === 'PUSH' ? 'Push' : type === 'EMAIL' ? 'Email' : 'SMS'}
      </span>
    );
  };

  const getAudienceBadge = (audience: string, targetSign?: string) => {
    const badges = {
      ALL: 'bg-emerald-600 text-white',
      SIGN: 'bg-blue-600 text-white',
      PREMIUM: 'bg-yellow-600 text-white',
      CUSTOM: 'bg-purple-600 text-white'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[audience as keyof typeof badges] || badges.ALL}`}>
        {audience === 'ALL' ? 'Все' :
         audience === 'SIGN' ? `${targetSign || 'Знак'}` :
         audience === 'PREMIUM' ? 'Премиум' : 'Кастом'}
      </span>
    );
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
          <h1 className="text-2xl font-bold text-white">Маркетинг</h1>
          <p className="text-zinc-400">Управление рассылками и push-уведомлениями</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <MegaphoneIcon className="w-4 h-4" />
          <span>Создать кампанию</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Всего кампаний</p>
              <p className="text-2xl font-bold text-white">{campaigns.length}</p>
            </div>
            <MegaphoneIcon className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Активные</p>
              <p className="text-2xl font-bold text-white">
                {campaigns.filter(c => c.status === 'SCHEDULED').length}
              </p>
            </div>
            <PaperAirplaneIcon className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Отправлено сегодня</p>
              <p className="text-2xl font-bold text-white">
                {campaigns
                  .filter(c => c.status === 'SENT')
                  .reduce((sum, c) => sum + c.sent, 0)}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Ошибки (24ч)</p>
              <p className="text-2xl font-bold text-white">
                {campaigns.reduce((sum, c) => sum + c.errors, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Кампания
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Аудитория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Статистика
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900 divide-y divide-zinc-800">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-zinc-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{campaign.name}</div>
                      <div className="text-sm text-zinc-400 max-w-xs truncate">{campaign.message}</div>
                      {campaign.scheduledAt && (
                        <div className="text-xs text-zinc-500">
                          Запланировано: {new Date(campaign.scheduledAt).toLocaleDateString('ru-RU')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(campaign.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getAudienceBadge(campaign.audience, campaign.targetSign)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Отправлено:</span>
                        <span className="text-white">{campaign.sent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Доставлено:</span>
                        <span className="text-white">{campaign.delivered}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Открыто:</span>
                        <span className="text-white">{campaign.opened}</span>
                      </div>
                      {campaign.errors > 0 && (
                        <div className="flex justify-between">
                          <span className="text-red-400">Ошибки:</span>
                          <span className="text-red-400">{campaign.errors}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-300 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Создать кампанию</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-zinc-400">Форма создания кампании будет реализована отдельно</p>
          </div>
        </div>
      )}
    </div>
  );
}






