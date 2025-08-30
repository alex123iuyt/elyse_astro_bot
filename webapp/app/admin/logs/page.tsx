"use client";

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, ExclamationTriangleIcon, InformationCircleIcon,
  ClockIcon, UserIcon, FunnelIcon
} from '@heroicons/react/24/outline';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  category: 'SYSTEM' | 'USER' | 'CONTENT' | 'AI' | 'PAYMENT';
  message: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
}

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const [logsRes, auditRes] = await Promise.all([
        fetch('/api/admin/logs'),
        fetch('/api/admin/logs/audit')
      ]);

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }

      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData.auditLogs || []);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelBadge = (level: string) => {
    const badges = {
      INFO: 'bg-blue-600 text-white',
      WARNING: 'bg-yellow-600 text-white',
      ERROR: 'bg-red-600 text-white',
      CRITICAL: 'bg-purple-600 text-white'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[level as keyof typeof badges] || badges.INFO}`}>
        {level}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      SYSTEM: 'bg-zinc-600 text-white',
      USER: 'bg-emerald-600 text-white',
      CONTENT: 'bg-blue-600 text-white',
      AI: 'bg-purple-600 text-white',
      PAYMENT: 'bg-yellow-600 text-white'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[category as keyof typeof badges] || badges.SYSTEM}`}>
        {category}
      </span>
    );
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
      case 'CRITICAL':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />;
      case 'WARNING':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />;
      default:
        return <InformationCircleIcon className="w-4 h-4 text-blue-400" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (selectedLevel && log.level !== selectedLevel) return false;
    if (selectedCategory && log.category !== selectedCategory) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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
          <h1 className="text-2xl font-bold text-white">Логи и аудит</h1>
          <p className="text-zinc-400">Просмотр системных логов и аудита действий</p>
        </div>
        <button
          onClick={loadLogs}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <ClockIcon className="w-4 h-4" />
          <span>Обновить</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Всего логов</p>
              <p className="text-2xl font-bold text-white">{logs.length}</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Ошибки (24ч)</p>
              <p className="text-2xl font-bold text-white">
                {logs.filter(log => 
                  (log.level === 'ERROR' || log.level === 'CRITICAL') &&
                  new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                ).length}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Предупреждения</p>
              <p className="text-2xl font-bold text-white">
                {logs.filter(log => log.level === 'WARNING').length}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Аудит действий</p>
              <p className="text-2xl font-bold text-white">{auditLogs.length}</p>
            </div>
            <UserIcon className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <div className="flex items-center space-x-3 mb-4">
                          <FunnelIcon className="w-5 h-5 text-zinc-400" />
          <h2 className="text-lg font-semibold text-white">Фильтры</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Поиск по сообщению..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Все уровни</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Все категории</option>
            <option value="SYSTEM">SYSTEM</option>
            <option value="USER">USER</option>
            <option value="CONTENT">CONTENT</option>
            <option value="AI">AI</option>
            <option value="PAYMENT">PAYMENT</option>
          </select>

          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="1h">Последний час</option>
            <option value="24h">Последние 24 часа</option>
            <option value="7d">Последние 7 дней</option>
            <option value="30d">Последние 30 дней</option>
            <option value="all">Все время</option>
          </select>

          <div className="text-sm text-zinc-400 flex items-center justify-center">
            Найдено: {filteredLogs.length}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Время
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Уровень
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Сообщение
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Пользователь
                </th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900 divide-y divide-zinc-800">
              {filteredLogs.slice(0, 100).map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {new Date(log.timestamp).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getLevelIcon(log.level)}
                      {getLevelBadge(log.level)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCategoryBadge(log.category)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white max-w-md truncate">
                      {log.message}
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="text-xs text-zinc-400 mt-1">
                        Метаданные: {Object.keys(log.metadata).join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {log.userName || log.userId || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Аудит действий пользователей</h2>
          <p className="text-zinc-400">История изменений и действий в системе</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Время
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Действие
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Ресурс
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                  Детали
                </th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900 divide-y divide-zinc-800">
              {auditLogs.slice(0, 50).map((audit) => (
                <tr key={audit.id} className="hover:bg-zinc-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {new Date(audit.timestamp).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{audit.userName}</div>
                    <div className="text-xs text-zinc-400">{audit.userId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-emerald-600 text-white rounded-full">
                      {audit.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {audit.resource}
                    {audit.resourceId && (
                      <div className="text-xs text-zinc-400">ID: {audit.resourceId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white max-w-md truncate">
                      {audit.details}
                    </div>
                    {audit.ipAddress && (
                      <div className="text-xs text-zinc-400 mt-1">
                        IP: {audit.ipAddress}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-4">Экспорт логов</h2>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Экспорт логов (CSV)
          </button>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
            Экспорт аудита (CSV)
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            Экспорт ошибок (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}
