"use client";
import { useEffect, useMemo, useState } from 'react';

function toast(message: string, type: 'success'|'error'|'info' = 'info') {
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type }}));
}

export default function BroadcastCreate({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [segment, setSegment] = useState<'all'|'premium'|'inactive'|'zodiac'>('all');
  const [inactiveDays, setInactiveDays] = useState(7);
  const [zodiac, setZodiac] = useState('');
  const [progress, setProgress] = useState<{ total: number; sent: number; failed: number; status: string } | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [buttonText, setButtonText] = useState('Открыть');
  const [buttonUrl, setButtonUrl] = useState('');
  const [parseMode, setParseMode] = useState<'Markdown'|'HTML'|'MarkdownV2'|''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [customButtons, setCustomButtons] = useState<Array<{text: string, url: string}>>([]);

  const canSend = useMemo(() => text.trim().length >= 3, [text]);

  // Обработка загрузки картинки
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB лимит
        toast('Файл слишком большой. Максимум 5MB', 'error');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast('Выберите изображение', 'error');
        return;
      }

      setImageFile(file);

      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Удаление картинки
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  // Добавление кастомной кнопки
  const addCustomButton = () => {
    if (customButtons.length >= 3) { // Telegram поддерживает максимум 3 кнопки
      toast('Максимум 3 кнопки', 'info');
      return;
    }
    setCustomButtons([...customButtons, { text: 'Кнопка', url: '' }]);
  };

  // Удаление кастомной кнопки
  const removeCustomButton = (index: number) => {
    setCustomButtons(customButtons.filter((_, i) => i !== index));
  };

  // Функция валидации URL (аналогичная серверной)
  const isValidUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;

    const cleanUrl = url.trim();
    if (!cleanUrl) return false;

    // Автоматически добавляем https:// если протокол не указан
    let processedUrl = cleanUrl;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      processedUrl = `https://${cleanUrl}`;
    }

    try {
      const u = new URL(processedUrl);

      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return false;
      }

      // Разрешаем localhost с любым портом
      if (u.hostname === 'localhost') {
        return true;
      }

      // Разрешаем IP адреса
      if (/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)) {
        return true;
      }

      // Для доменов проверяем минимальную валидность
      const hostname = u.hostname;
      if (hostname.length > 0 && hostname.length < 253) {
        if (hostname === 'localhost' || hostname === 'test' || hostname === 'dev') {
          return true;
        }
        if (hostname.includes('.')) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  };

  // Обновление кастомной кнопки
  const updateCustomButton = (index: number, field: 'text' | 'url', value: string) => {
    const newButtons = [...customButtons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setCustomButtons(newButtons);
  };

  const startBroadcast = async () => {
    if (!canSend || isSending) return; // Предотвращаем множественные вызовы

    // Проверяем валидность всех ссылок в кнопках
    const invalidButtons = customButtons.filter(btn => btn.url && !isValidUrl(btn.url));
    if (invalidButtons.length > 0) {
      toast(`Исправьте ссылки в кнопках: ${invalidButtons.map(btn => btn.text || 'Без названия').join(', ')}`, 'error');
      return;
    }

    setIsSending(true);

    console.log('[BROADCAST_UI] Starting broadcast with params:', {
      title: title || 'Сообщение',
      text,
      segment,
      inactiveDays,
      zodiac,
      buttonText: buttonUrl ? buttonText : undefined,
      buttonUrl: buttonUrl || undefined,
      parseMode: parseMode || undefined,
      hasImage: !!imageFile,
      customButtons: customButtons.length > 0 ? customButtons : undefined
    });

    console.log('[BROADCAST_UI] customButtons details:', {
      length: customButtons.length,
      buttons: customButtons,
      type: typeof customButtons
    });

    try {
      // Создаем FormData для отправки файла
      const formData = new FormData();
      formData.append('title', title || 'Сообщение');
      formData.append('text', text);
      formData.append('segment', segment);
      formData.append('inactiveDays', inactiveDays.toString());
      formData.append('zodiac', zodiac);

      if (buttonUrl) {
        formData.append('buttonText', buttonText);
        formData.append('buttonUrl', buttonUrl);
      }

      if (parseMode) {
        formData.append('parseMode', parseMode);
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (customButtons.length > 0) {
        const customButtonsJson = JSON.stringify(customButtons);
        formData.append('customButtons', customButtonsJson);
        console.log('[BROADCAST_UI] Appending customButtons to FormData:', customButtonsJson);
      }

      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      console.log('[BROADCAST_UI] API response:', data);

      if (data.success) {
        setJobId(data.jobId);
        setProgress({ total: data.total, sent: 0, failed: 0, status: 'queued' });
        setShowProgress(true);
        toast('Рассылка создана и запущена', 'success');
        console.log('[BROADCAST_UI] Broadcast created successfully:', { jobId: data.jobId, total: data.total });

        // Уведомляем таблицу истории об обновлении
        window.dispatchEvent(new CustomEvent('broadcast:created'));
      } else {
        console.error('[BROADCAST_UI] Broadcast creation failed:', data.error);
        toast(data.error || 'Ошибка запуска рассылки', 'error');
      }
    } catch (e) {
      console.error('[BROADCAST_UI] Network error:', e);
      toast('Ошибка сети', 'error');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    let timer: any;
    let finished = false;
    if (jobId) {
      // первое срабатывание процессора и подписка на SSE
      console.log('[BROADCAST_UI] Starting processor and SSE connection for job:', jobId);
      fetch('/api/admin/notifications/process', { method: 'POST' });

      // Запускаем периодическое срабатывание процессора для автоматической обработки очереди
      timer = setInterval(() => {
        if (!finished) {
          console.log('[BROADCAST_UI] Triggering processor for job:', jobId);
          fetch('/api/admin/notifications/process', { method: 'POST' });
        }
      }, 10000); // Каждые 10 секунд (увеличили интервал для уменьшения спама)

      const es = new EventSource(`/api/admin/notifications/sse/${jobId}`);
      es.addEventListener('progress', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          console.log('[BROADCAST_UI] SSE progress event:', data);

          setProgress({ total: data.total, sent: data.sent, failed: data.failed, status: data.status });

          if (data.status === 'done' || data.status === 'failed') {
            finished = true;
            try { es.close(); } catch {}
            if (timer) clearInterval(timer);

            console.log('[BROADCAST_UI] Broadcast finished:', { status: data.status, sent: data.sent, failed: data.failed, total: data.total });

            toast(data.status === 'done' ? 'Рассылка завершена' : 'Рассылка завершилась с ошибками', data.status === 'done' ? 'success' : 'error');
            
            // Закрываем модалку после завершения рассылки
            if (onSuccess) {
              setTimeout(() => onSuccess(), 2000); // Даем время увидеть финальный статус
            }
          }
        } catch (parseError) {
          console.error('[BROADCAST_UI] SSE parse error:', parseError, 'Raw data:', e.data);
        }
      });
      es.addEventListener('ping', () => {});
      es.addEventListener('error', () => es.close());

      return () => {
        try { es.close(); } catch {}
        if (timer) clearInterval(timer);
      };
    }
    return () => {};
  }, [jobId]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col h-[70vh]">
        {/* Скроллируемый контент */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Сегмент</label>
              <select value={segment} onChange={e=>setSegment(e.target.value as any)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white">
                <option value="all">Все пользователи</option>
                <option value="premium">Только премиум</option>
                <option value="inactive">Неактивные</option>
                <option value="zodiac">По знаку зодиака</option>
              </select>
            </div>
            {segment==='inactive' && (
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Не активны дней</label>
                <input type="number" min={1} value={inactiveDays} onChange={e=>setInactiveDays(parseInt(e.target.value||'7',10))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white" />
              </div>
            )}
            {segment==='zodiac' && (
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Знак зодиака</label>
                <input value={zodiac} onChange={e=>setZodiac(e.target.value)} placeholder="Напр.: Стрелец" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Заголовок (опционально)</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Введите заголовок рассылки"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Текст сообщения</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Введите текст сообщения для рассылки..."
              rows={6}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Загрузка картинки */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Картинка (опционально)</label>
            <p className="text-xs text-zinc-500 mb-2">💡 Картинки отправляются как сообщения с пометкой 🖼️ и поддерживают HTML/Markdown форматирование</p>
            {!imageFile ? (
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-zinc-400 mb-2">Нажмите для выбора картинки</div>
                  <div className="text-xs text-zinc-500">PNG, JPG, GIF до 5MB</div>
                </label>
              </div>
            ) : (
              <div className="relative">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg" />
                )}
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Кастомные кнопки */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-sm text-zinc-400">Кастомные кнопки (опционально)</label>
                <p className="text-xs text-zinc-500 mt-1">💡 Можно вводить просто домен (например: example.com) - https:// добавится автоматически</p>
              </div>
              <button
                onClick={addCustomButton}
                disabled={customButtons.length >= 3}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-white text-sm rounded"
              >
                + Добавить кнопку
              </button>
            </div>
            {customButtons.length > 0 && (
              <div className="space-y-2">
                {customButtons.map((button, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        value={button.text}
                        onChange={(e) => updateCustomButton(index, 'text', e.target.value)}
                        placeholder="Текст кнопки"
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white text-sm"
                      />
                      <input
                        value={button.url}
                        onChange={(e) => updateCustomButton(index, 'url', e.target.value)}
                        placeholder="example.com или https://example.com"
                        className={`flex-1 bg-zinc-800 border rounded-lg p-2 text-white text-sm ${
                          button.url ? (isValidUrl(button.url) ? 'border-green-600' : 'border-red-600') : 'border-zinc-700'
                        }`}
                      />
                      <button
                        onClick={() => removeCustomButton(index)}
                        className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        ✕
                      </button>
                    </div>
                    {button.url && (
                      <div className={`text-xs px-2 py-1 rounded ${
                        isValidUrl(button.url)
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}>
                        {isValidUrl(button.url)
                          ? `✅ Ссылка валидна: ${button.url.startsWith('http') ? button.url : `https://${button.url}`}`
                          : '❌ Неверный формат ссылки'
                        }
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Parse Mode</label>
            <select value={parseMode} onChange={e=>setParseMode(e.target.value as any)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white">
              <option value="">Без форматирования</option>
              <option value="Markdown">Markdown</option>
              <option value="MarkdownV2">MarkdownV2</option>
              <option value="HTML">HTML</option>
            </select>
          </div>
        </div>

        {/* Фиксированная кнопка и прогресс внизу */}
        <div className="border-t border-zinc-800 p-6 bg-zinc-900/50">
          <div className="flex items-center justify-center mb-4">
            <button
              disabled={!canSend || isSending}
              onClick={startBroadcast}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 rounded-xl font-medium text-lg min-w-[200px] transition-colors"
            >
              {isSending ? 'Запуск...' : 'Запустить рассылку'}
            </button>
          </div>

          {showProgress && progress && (
            <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="flex items-center justify-between text-sm text-zinc-300 mb-3">
                <span className="flex items-center gap-2">
                  {progress.status === 'running' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                  Статус: {
                    progress.status === 'queued' ? '⏳ В очереди' :
                    progress.status === 'running' ? '🔄 Выполняется' :
                    progress.status === 'done' ? '✅ Завершено' :
                    progress.status === 'failed' ? '❌ Ошибка' :
                    progress.status
                  }
                </span>
                <span className="font-mono">
                  {progress.sent}/{progress.total} 
                  ({Math.floor((progress.sent / Math.max(1, progress.total)) * 100)}%)
                </span>
              </div>
              
              <div className="w-full h-3 bg-zinc-700 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    progress.status === 'done' ? 'bg-green-500' :
                    progress.status === 'failed' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.floor((progress.sent / Math.max(1, progress.total)) * 100))}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Отправлено: {progress.sent}</span>
                {progress.failed > 0 && <span className="text-red-400">Ошибок: {progress.failed}</span>}
                <span>Всего: {progress.total}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
