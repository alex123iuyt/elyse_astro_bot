"use client";
import { useEffect, useState } from 'react';

interface JobRow {
  id: number;
  title: string | null;
  text: string;
  total: number;
  sent: number;
  failed: number;
  status: string;
  created_at: string;
}

interface JobActionResponse {
  success: boolean;
  message?: string;
  newStatus?: string;
  error?: string;
}

interface JobErrors {
  id: number;
  telegram_id: string;
  error: string;
  status: string;
  sent_at: string;
  bot_user_id: string;
  user_name: string | null;
  user_telegram_id: string;
}

export default function BroadcastHistory() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobRow | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [jobErrors, setJobErrors] = useState<JobErrors[]>([]);
  const [errorsLoading, setErrorsLoading] = useState(false);

  useEffect(() => {
    load();
    
    // Автоматически обновляем каждые 5 секунд
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const load = async () => {
    try {
      const res = await fetch('/api/admin/notifications/history');
      const data = await res.json();
      if (data.success) {
        setJobs(data.rows);
        setLastUpdated(new Date());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const manageJob = async (jobId: number, action: 'cancel' | 'pause' | 'resume' | 'delete') => {
    try {
      const res = await fetch(`/api/admin/notifications/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      const data: JobActionResponse = await res.json();
      
      if (data.success) {
        // Обновляем локальное состояние
        setJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { ...job, status: data.newStatus || job.status }
            : job
        ));
        
        // Показываем уведомление
        if (data.message) {
          window.dispatchEvent(new CustomEvent('app:toast', { 
            detail: { message: data.message, type: 'success' } 
          }));
        }
        
        // Если рассылка удалена, убираем её из списка
        if (action === 'delete') {
          setJobs(prev => prev.filter(job => job.id !== jobId));
        }
      } else {
        window.dispatchEvent(new CustomEvent('app:toast', { 
          detail: { message: data.error || 'Ошибка операции', type: 'error' } 
        }));
      }
    } catch (error) {
      console.error('Error managing job:', error);
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { message: 'Ошибка сети', type: 'error' } 
      }));
    }
  };

  const canManageJob = (job: JobRow, action: 'cancel' | 'pause' | 'resume' | 'delete') => {
    switch (action) {
      case 'cancel':
        return job.status === 'queued' || job.status === 'running';
      case 'pause':
        return job.status === 'running';
      case 'resume':
        return job.status === 'paused';
      case 'delete':
        return job.status === 'queued' || job.status === 'cancelled' || job.status === 'failed';
      default:
        return false;
    }
  };

  const bulkAction = async (action: 'cancel_old' | 'cleanup_completed' | 'pause_all_running', days?: number) => {
    try {
      const res = await fetch('/api/admin/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, days })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Показываем уведомление
        if (data.message) {
          window.dispatchEvent(new CustomEvent('app:toast', { 
            detail: { message: data.message, type: 'success' } 
          }));
        }
        
        // Перезагружаем список
        await load();
      } else {
        window.dispatchEvent(new CustomEvent('app:toast', { 
          detail: { message: data.error || 'Ошибка операции', type: 'error' } 
        }));
      }
    } catch (error) {
      console.error('Error in bulk action:', error);
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { message: 'Ошибка сети', type: 'error' } 
      }));
    }
  };

  const loadJobErrors = async (jobId: number) => {
    try {
      setErrorsLoading(true);
      const res = await fetch(`/api/admin/notifications/${jobId}/errors`);
      const data = await res.json();
      
      if (data.success) {
        setJobErrors(data.errors || []);
        setShowErrors(true);
      } else {
        window.dispatchEvent(new CustomEvent('app:toast', { 
          detail: { message: data.error || 'Ошибка загрузки', type: 'error' } 
        }));
      }
    } catch (error) {
      console.error('Error loading job errors:', error);
      window.dispatchEvent(new CustomEvent('app:toast', { 
        detail: { message: 'Ошибка сети', type: 'error' } 
      }));
    } finally {
      setErrorsLoading(false);
    }
  };

  if (isLoading && jobs.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Загрузка истории рассылок...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">История рассылок</h2>
          {lastUpdated && (
            <p className="text-xs text-zinc-500 mt-1">
              Последнее обновление: {lastUpdated.toLocaleTimeString('ru-RU')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => bulkAction('cancel_old', 7)}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
            title="Отменить старые рассылки (старше 7 дней)"
          >
            🚫 Отменить старые
          </button>
          <button 
            onClick={() => bulkAction('cleanup_completed')}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
            title="Удалить завершенные рассылки старше 30 дней"
          >
            🗑️ Очистить
          </button>
          <button 
            onClick={() => bulkAction('pause_all_running')}
            className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded"
            title="Приостановить все активные рассылки"
          >
            ⏸️ Пауза всех
          </button>
          <button 
            onClick={load} 
            disabled={isLoading}
            className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 rounded-lg text-sm flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                Обновление...
              </>
            ) : (
              <>
                🔄 Обновить
              </>
            )}
          </button>
        </div>
      </div>
      
      {jobs.length === 0 ? (
        <div className="text-center py-8 text-zinc-400">
          <p>История рассылок пуста</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-400 border-b border-zinc-700">
                <th className="p-2 pb-3">ID</th>
                <th className="p-2 pb-3">Заголовок</th>
                <th className="p-2 pb-3">Статус</th>
                <th className="p-2 pb-3">Отправлено</th>
                <th className="p-2 pb-3">Ошибок</th>
                <th className="p-2 pb-3">Всего</th>
                <th className="p-2 pb-3">Создана</th>
                <th className="p-2 pb-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <td className="p-2 text-zinc-300">{j.id}</td>
                  <td className="p-2">
                    <div className="max-w-xs truncate" title={j.title || 'Без заголовка'}>
                      {j.title || '—'}
                    </div>
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      j.status === 'done' ? 'bg-green-600 text-white' : 
                      j.status === 'running' ? 'bg-blue-600 text-white' : 
                      j.status === 'failed' ? 'bg-red-600 text-white' : 
                      j.status === 'cancelled' ? 'bg-gray-600 text-white' :
                      j.status === 'paused' ? 'bg-yellow-600 text-white' :
                      'bg-zinc-600 text-white'
                    }`}>
                      {j.status === 'done' ? '✅ Завершено' : 
                       j.status === 'running' ? '🔄 Выполняется' : 
                       j.status === 'failed' ? '❌ Ошибка' : 
                       j.status === 'cancelled' ? '🚫 Отменено' :
                       j.status === 'paused' ? '⏸️ Приостановлено' :
                       j.status === 'queued' ? '⏳ В очереди' :
                       j.status}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className={`font-medium ${j.sent > 0 ? 'text-green-400' : 'text-zinc-400'}`}>
                      {j.sent}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className={`font-medium ${j.failed > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                      {j.failed}
                    </span>
                  </td>
                  <td className="p-2 text-zinc-300">{j.total}</td>
                  <td className="p-2 text-zinc-400 text-xs">
                    {new Date(j.created_at).toLocaleString('ru-RU')}
                  </td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => {
                          setSelectedJob(j);
                          setShowDetails(true);
                        }}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                        title="Просмотреть детали"
                      >
                        👁️
                      </button>
                      {j.failed > 0 && (
                        <button
                          onClick={() => loadJobErrors(j.id)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                          title={`Просмотреть ${j.failed} ошибок`}
                        >
                          ❌
                        </button>
                      )}
                      {canManageJob(j, 'cancel') && (
                        <button
                          onClick={() => manageJob(j.id, 'cancel')}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                          title="Отменить рассылку"
                        >
                          🚫
                        </button>
                      )}
                      {canManageJob(j, 'pause') && (
                        <button
                          onClick={() => manageJob(j.id, 'pause')}
                          className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded"
                          title="Приостановить рассылку"
                        >
                          ⏸️
                        </button>
                      )}
                      {canManageJob(j, 'resume') && (
                        <button
                          onClick={() => manageJob(j.id, 'resume')}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                          title="Возобновить рассылку"
                        >
                          ▶️
                        </button>
                      )}
                      {canManageJob(j, 'delete') && (
                        <button
                          onClick={() => manageJob(j.id, 'delete')}
                          className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
                          title="Удалить рассылку"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Модальное окно с деталями рассылки */}
      {showDetails && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Детали рассылки #{selectedJob.id}</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Заголовок</label>
                <p className="text-white">{selectedJob.title || 'Без заголовка'}</p>
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Текст сообщения</label>
                <div className="bg-zinc-800 rounded-lg p-3 text-white text-sm whitespace-pre-wrap">
                  {selectedJob.text}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Статус</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedJob.status === 'done' ? 'bg-green-600 text-white' : 
                    selectedJob.status === 'running' ? 'bg-blue-600 text-white' : 
                    selectedJob.status === 'failed' ? 'bg-red-600 text-white' : 
                    selectedJob.status === 'cancelled' ? 'bg-gray-600 text-white' :
                    selectedJob.status === 'paused' ? 'bg-yellow-600 text-white' :
                    'bg-zinc-600 text-white'
                  }`}>
                    {selectedJob.status === 'done' ? '✅ Завершено' : 
                     selectedJob.status === 'running' ? '🔄 Выполняется' : 
                     selectedJob.status === 'failed' ? '❌ Ошибка' : 
                     selectedJob.status === 'cancelled' ? '🚫 Отменено' :
                     selectedJob.status === 'paused' ? '⏸️ Приостановлено' :
                     selectedJob.status === 'queued' ? '⏳ В очереди' :
                     selectedJob.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Создана</label>
                  <p className="text-white text-sm">
                    {new Date(selectedJob.created_at).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Всего получателей</label>
                  <p className="text-white text-lg font-semibold">{selectedJob.total}</p>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Отправлено</label>
                  <p className="text-green-400 text-lg font-semibold">{selectedJob.sent}</p>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Ошибок</label>
                  <p className="text-red-400 text-lg font-semibold">{selectedJob.failed}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно с ошибками рассылки */}
      {showErrors && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ошибки рассылки #{selectedJob?.id}</h3>
              <button
                onClick={() => setShowErrors(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {errorsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-zinc-400">Загрузка ошибок...</p>
              </div>
            ) : jobErrors.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <p>Ошибок не найдено</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-zinc-400 mb-4">
                  Найдено {jobErrors.length} ошибок
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-zinc-400 border-b border-zinc-700">
                        <th className="p-2 pb-3">ID</th>
                        <th className="p-2 pb-3">Telegram ID</th>
                        <th className="p-2 pb-3">Пользователь</th>
                        <th className="p-2 pb-3">Ошибка</th>
                        <th className="p-2 pb-3">Время</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobErrors.map(error => (
                        <tr key={error.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                          <td className="p-2 text-zinc-300">{error.id}</td>
                          <td className="p-2 text-zinc-300 font-mono text-xs">{error.telegram_id}</td>
                          <td className="p-2">
                            <div>
                              <div className="text-white">{error.user_name || 'Неизвестно'}</div>
                              <div className="text-xs text-zinc-400">{error.user_telegram_id}</div>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="max-w-md">
                              <div className="text-red-400 font-mono text-xs break-all">
                                {error.error}
                              </div>
                            </div>
                          </td>
                          <td className="p-2 text-zinc-400 text-xs">
                            {error.sent_at ? new Date(error.sent_at).toLocaleString('ru-RU') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setShowErrors(false)}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

