"use client";

import { useState, useEffect } from 'react';
import { 
  UsersIcon, ChatBubbleLeftRightIcon, StarIcon,
  EyeIcon, PencilIcon, TrashIcon
} from '@heroicons/react/24/outline';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'OPERATOR' | 'LEAD' | 'ADMIN';
  status: 'ONLINE' | 'OFFLINE' | 'AWAY';
  lastSeen: string;
  metrics: {
    totalChats: number;
    averageRating: number;
    responseTime: number;
    satisfactionScore: number;
  };
  isActive: boolean;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      OPERATOR: 'bg-blue-600 text-white',
      LEAD: 'bg-yellow-600 text-white',
      ADMIN: 'bg-purple-600 text-white'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[role as keyof typeof badges] || badges.OPERATOR}`}>
        {role === 'OPERATOR' ? 'Оператор' :
         role === 'LEAD' ? 'Лидер' : 'Администратор'}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ONLINE: 'bg-emerald-600 text-white',
      OFFLINE: 'bg-zinc-600 text-white',
      AWAY: 'bg-yellow-600 text-white'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[status as keyof typeof badges] || badges.OFFLINE}`}>
        {status === 'ONLINE' ? 'Онлайн' :
         status === 'OFFLINE' ? 'Оффлайн' : 'Отошел'}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>;
      case 'OFFLINE':
        return <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>;
      case 'AWAY':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>;
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Сотрудники</h1>
          <p className="text-zinc-400">Управление чат-операторами и персоналом</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <UsersIcon className="w-4 h-4" />
          <span>Добавить сотрудника</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Всего сотрудников</p>
              <p className="text-2xl font-bold text-white">{staff.length}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Онлайн</p>
              <p className="text-2xl font-bold text-white">
                {staff.filter(s => s.status === 'ONLINE').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Активные чаты</p>
              <p className="text-2xl font-bold text-white">
                {staff.reduce((sum, s) => sum + s.metrics.totalChats, 0)}
              </p>
            </div>
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Средний рейтинг</p>
              <p className="text-2xl font-bold text-white">
                {(staff.reduce((sum, s) => sum + s.metrics.averageRating, 0) / staff.length).toFixed(1)}
              </p>
            </div>
            <StarIcon className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Сотрудник
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Метрики
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Последний вход
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900 divide-y divide-zinc-800">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">{member.name}</div>
                        <div className="text-sm text-zinc-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(member.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(member.status)}
                      {getStatusBadge(member.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Чаты:</span>
                        <span className="text-white">{member.metrics.totalChats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Рейтинг:</span>
                        <span className="text-white">{member.metrics.averageRating.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Время ответа:</span>
                        <span className="text-white">{member.metrics.responseTime}м</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {new Date(member.lastSeen).toLocaleDateString('ru-RU')}
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

      {/* Performance Metrics */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-4">Метрики производительности</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-2">
              {staff.length > 0 ? 
                (staff.reduce((sum, s) => sum + s.metrics.satisfactionScore, 0) / staff.length).toFixed(1) : '0'
              }
            </div>
            <p className="text-sm text-zinc-400">Средний индекс удовлетворенности</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {staff.length > 0 ? 
                (staff.reduce((sum, s) => sum + s.metrics.responseTime, 0) / staff.length).toFixed(0) : '0'
              }м
            </div>
            <p className="text-sm text-zinc-400">Среднее время ответа</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {staff.length > 0 ? 
                (staff.reduce((sum, s) => sum + s.metrics.averageRating, 0) / staff.length).toFixed(1) : '0'
              }
            </div>
            <p className="text-sm text-zinc-400">Средний рейтинг</p>
          </div>
        </div>
      </div>

      {/* Role Permissions */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-4">Роли и права доступа</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h3 className="text-md font-medium text-white mb-3">Оператор</h3>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Чтение контента</li>
              <li>• Ответы в чате</li>
              <li>• Просмотр профилей пользователей</li>
              <li>• Базовые метрики</li>
            </ul>
          </div>
          
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h3 className="text-md font-medium text-white mb-3">Лидер</h3>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Все права оператора</li>
              <li>• Управление операторами</li>
              <li>• Расширенные метрики</li>
              <li>• Модерация контента</li>
            </ul>
          </div>
          
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h3 className="text-md font-medium text-white mb-3">Администратор</h3>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Полный доступ</li>
              <li>• Управление системой</li>
              <li>• Настройки и интеграции</li>
              <li>• Аудит и логи</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Добавить сотрудника</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-zinc-400">Форма добавления сотрудника будет реализована отдельно</p>
          </div>
        </div>
      )}
    </div>
  );
}






