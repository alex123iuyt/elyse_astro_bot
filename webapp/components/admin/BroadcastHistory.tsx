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
  image_url?: string | null;
  custom_buttons?: any[] | null;
  has_image?: boolean;
  has_buttons?: boolean;
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
  const [showLogs, setShowLogs] = useState(false);
  const [jobErrors, setJobErrors] = useState<JobErrors[]>([]);
  const [jobLogs, setJobLogs] = useState<any[]>([]);
  const [errorsLoading, setErrorsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    load();
    
    // Автоматически обновляем каждые 3 секунды если есть активные рассылки
    const interval = setInterval(() => {
      const hasActiveJobs = jobs.some(job => job.status === 'running' || job.status === 'queued');
      if (hasActiveJobs || jobs.length === 0) {
        load();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [jobs]);

  // Слушаем события создания новых рассылок
  useEffect(() => {
    const handleBroadcastCreated = () => {
      setTimeout(() => load(), 500); // Небольшая задержка для обновления после создания
    };

    window.addEventListener('broadcast:created', handleBroadcastCreated);
    return () => window.removeEventListener('broadcast:created', handleBroadcastCreated);
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

  const loadJobLogs = async (jobId: number) => {
    try {
      setLogsLoading(true);
      const res = await fetch(`/api/admin/logs?category=BROADCAST&limit=100`);
      const data = await res.json();

      if (data.logs) {
        // Фильтруем логи по jobId
        const jobLogsFiltered = data.logs.filter((log: any) =>
          log.metadata && log.metadata.jobId === jobId
        );
        setJobLogs(jobLogsFiltered);
        setShowLogs(true);
      } else {
        window.dispatchEvent(new CustomEvent('app:toast', {
          detail: { message: 'Ошибка загрузки логов', type: 'error' }
        }));
      }
    } catch (error) {
      console.error('Error loading job logs:', error);
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message: 'Ошибка сети', type: 'error' }
      }));
    } finally {
      setLogsLoading(false);
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
    <div className="bg-zinc-900 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between p-6 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-semibold">История рассылок</h2>
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

        </div>
      </div>
      
      {jobs.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-lg">История рассылок пуста</p>
          <p className="text-sm text-zinc-500 mt-2">Создайте первую рассылку, нажав кнопку "Создать рассылку"</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-400 border-b border-zinc-700">
                <th className="p-4 pb-3">ID</th>
                <th className="p-4 pb-3">Заголовок</th>
                <th className="p-4 pb-3">Медиа</th>
                <th className="p-4 pb-3">Статус</th>
                <th className="p-4 pb-3">Отправлено</th>
                <th className="p-4 pb-3">Ошибок</th>
                <th className="p-4 pb-3">Всего</th>
                <th className="p-4 pb-3">Создана</th>
                <th className="p-4 pb-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 text-zinc-300">{j.id}</td>
                  <td className="p-4">
                    <div className="max-w-xs truncate" title={j.title || 'Без заголовка'}>
                      {j.title || '—'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {j.has_image && (
                        <div className="flex items-center space-x-1 text-yellow-400" title={`Картинка: ${j.image_url}`}>
                          <span>🖼️</span>
                          <span className="text-xs">Фото</span>
                        </div>
                      )}
                      {j.has_buttons && j.custom_buttons && (
                        <div className="flex items-center space-x-1 text-blue-400" title={`Кнопки: ${j.custom_buttons.map((btn: any) => btn.text).join(', ')}`}>
                          <span>🔘</span>
                          <span className="text-xs">{j.custom_buttons.length}</span>
                        </div>
                      )}
                      {!j.has_image && !j.has_buttons && (
                        <span className="text-zinc-500 text-xs">Только текст</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {j.status === 'running' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        j.status === 'done' ? 'bg-green-600 text-white' :
                        j.status === 'running' ? 'bg-blue-600 text-white animate-pulse' :
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
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${j.sent > 0 ? 'text-green-400' : 'text-zinc-400'}`}>
                      {j.sent}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${j.failed > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                      {j.failed}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-300">{j.total}</td>
                  <td className="p-4 text-zinc-400 text-xs">
                    {new Date(j.created_at).toLocaleString('ru-RU')}
                  </td>
                  <td className="p-4">
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
                      <button
                        onClick={() => loadJobLogs(j.id)}
                        className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded"
                        title="Просмотреть логи рассылки"
                      >
                        📋
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Детали рассылки #{selectedJob.id}</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-zinc-400 hover:text-white p-1"
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

              {/* Медиа информация */}
              {(selectedJob.has_image || selectedJob.has_buttons) && (
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Медиа контент</label>
                  <div className="space-y-2">
                    {selectedJob.has_image && (
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                          <span>🖼️</span>
                          <span className="font-medium">Картинка</span>
                        </div>
                        {selectedJob.image_url && (
                          <img
                            src={selectedJob.image_url}
                            alt="Broadcast image"
                            className="max-w-full max-h-48 object-contain rounded"
                          />
                        )}
                      </div>
                    )}

                    {selectedJob.has_buttons && selectedJob.custom_buttons && (
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-blue-400 mb-2">
                          <span>🔘</span>
                          <span className="font-medium">Кнопки ({selectedJob.custom_buttons.length})</span>
                        </div>
                        <div className="space-y-1">
                          {selectedJob.custom_buttons.map((button: any, index: number) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <span className="text-zinc-400">{index + 1}.</span>
                              <span className="text-white">{button.text}</span>
                              <span className="text-zinc-400">→</span>
                              <span className="text-blue-400">{button.url}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Ошибки рассылки #{selectedJob?.id}</h3>
              <button
                onClick={() => setShowErrors(false)}
                className="text-zinc-400 hover:text-white p-1"
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

      {/* Модальное окно с логами рассылки */}
      {showLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Логи рассылки #{selectedJob?.id}</h3>
              <button
                onClick={() => setShowLogs(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {logsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-zinc-400">Загрузка логов...</p>
              </div>
            ) : jobLogs.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <p>Логи для этой рассылки не найдены</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-zinc-400 mb-4">
                  Найдено {jobLogs.length} записей в логах
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-zinc-400 border-b border-zinc-700">
                        <th className="p-3 pb-3">Время</th>
                        <th className="p-3 pb-3">Уровень</th>
                        <th className="p-3 pb-3">Действие</th>
                        <th className="p-3 pb-3">Сообщение</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobLogs.map((log) => (
                        <tr key={log.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                          <td className="p-3 text-zinc-300">
                            {new Date(log.timestamp).toLocaleString('ru-RU')}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              log.level === 'INFO' ? 'bg-blue-600 text-white' :
                              log.level === 'WARNING' ? 'bg-yellow-600 text-white' :
                              log.level === 'ERROR' ? 'bg-red-600 text-white' :
                              log.level === 'CRITICAL' ? 'bg-purple-600 text-white' :
                              'bg-zinc-600 text-white'
                            }`}>
                              {log.level}
                            </span>
                          </td>
                          <td className="p-3 text-zinc-300">
                            {log.metadata?.action || '—'}
                          </td>
                          <td className="p-3">
                            <div className="text-sm text-white max-w-md truncate">
                              {log.message}
                            </div>
                            {log.metadata && Object.keys(log.metadata).length > 1 && (
                              <div className="text-xs text-zinc-400 mt-1">
                                Детали: {JSON.stringify(
                                  Object.fromEntries(
                                    Object.entries(log.metadata).filter(([key]) => key !== 'action')
                                  ),
                                  null,
                                  0
                                )}
                              </div>
                            )}
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
                onClick={() => setShowLogs(false)}
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

