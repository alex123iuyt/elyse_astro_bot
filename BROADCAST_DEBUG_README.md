# Диагностика проблем рассылки

## Проблема
Рассылка помечается как завершенная (`done`), но при этом:
- **Отправлено: 0/1** - ничего не отправлено
- **Ошибок: 1** - есть ошибки
- Статус `done` но с ошибками

## Причины проблемы

### 1. **Отсутствие BOT_TOKEN**
- Переменная окружения `BOT_TOKEN` не установлена
- Токен бота недействителен или истек

### 2. **Проблемы с получателями**
- `telegram_id` получателей пустой или невалидный
- Получатели не найдены в базе данных
- Проблемы с фильтрацией пользователей

### 3. **Ошибки Telegram API**
- Бот заблокирован пользователем
- Неверный формат сообщения
- Проблемы с кнопками или форматированием

### 4. **Проблемы с базой данных**
- Неправильная структура таблиц
- Ошибки в SQL запросах
- Проблемы с транзакциями

## Диагностика

### 1. **Проверка логов**
После добавления детального логирования, в консоли будут видны:
```
[BROADCAST_PROCESS] Starting broadcast processing...
[BROADCAST_PROCESS] Processing job 74: { title: "23123", status: "running", total: 1, sent: 0, failed: 0 }
[BROADCAST_PROCESS] Found 1 pending recipients for job 74
[BROADCAST_PROCESS] Processing recipient 123 (telegram_id: 123456789)
[BROADCAST_PROCESS] Filter for recipient 123: { buttonText: "Открыть", buttonUrl: "321231", parseMode: "Без форматирования" }
[BROADCAST_PROCESS] Sending to telegram_id=123456789 { payload: {...}, hasButton: true }
[BROADCAST_PROCESS] Telegram API response for 123456789: { ok: false, error: "Forbidden: bot was blocked by the user", status: 403 }
[BROADCAST_PROCESS] Recipient 123 failed: { error: "Forbidden: bot was blocked by the user" }
```

### 2. **Запуск тестового скрипта**
```bash
# Установка переменных окружения
export BOT_TOKEN="your_bot_token_here"
export BASE_URL="http://localhost:3000"

# Запуск теста
node scripts/test-broadcast.js
```

### 3. **Проверка базы данных**
```bash
node scripts/check-db.js
```

### 4. **Проверка переменных окружения**
```bash
echo "BOT_TOKEN: $BOT_TOKEN"
echo "NODE_ENV: $NODE_ENV"
```

## Исправления

### 1. **Добавлено детальное логирование**
- Все этапы обработки логируются
- Ошибки Telegram API детально записываются
- Статистика по каждому получателю

### 2. **Улучшена обработка ошибок**
- Каждый получатель обрабатывается в try-catch
- Ошибки не прерывают обработку других получателей
- Детальная информация об ошибках сохраняется в БД

### 3. **Исправлена логика завершения**
- Job помечается как `done` только после обработки всех получателей
- Финальная статистика собирается корректно
- Убраны ложные завершения

### 4. **Добавлена валидация**
- Проверка наличия BOT_TOKEN
- Валидация telegram_id
- Проверка структуры сообщения

## Тестирование

### 1. **Создание тестовой рассылки**
```javascript
const response = await fetch('/api/admin/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Тест',
    text: 'Тестовое сообщение',
    segment: 'all',
    buttonText: 'Открыть',
    buttonUrl: 'https://example.com'
  })
});
```

### 2. **Запуск обработки**
```bash
curl -X POST http://localhost:3000/api/admin/notifications/process
```

### 3. **Мониторинг через SSE**
```javascript
const eventSource = new EventSource('/api/admin/notifications/sse/74');
eventSource.addEventListener('progress', (event) => {
  const data = JSON.parse(event.data);
  console.log('Прогресс:', data);
});
```

## Частые ошибки и решения

### 1. **"Forbidden: bot was blocked by the user"**
- **Причина**: Пользователь заблокировал бота
- **Решение**: Убрать пользователя из рассылки или уведомить админа

### 2. **"Bad Request: can't parse entities"**
- **Причина**: Неверный формат HTML/Markdown
- **Решение**: Проверить текст на корректность разметки

### 3. **"Bad Request: wrong button text"**
- **Причина**: Неверный текст кнопки
- **Решение**: Проверить длину и символы в тексте кнопки

### 4. **"Bad Request: wrong button URL"**
- **Причина**: Неверный URL кнопки
- **Решение**: Проверить формат URL

### 5. **"Missing BOT_TOKEN"**
- **Причина**: Переменная окружения не установлена
- **Решение**: Добавить BOT_TOKEN в .env файл

## Мониторинг

### 1. **Логи в реальном времени**
```bash
# Следим за логами процесса
tail -f logs/broadcast.log

# Или за консолью приложения
npm run dev
```

### 2. **Метрики рассылки**
- Количество успешных отправок
- Количество ошибок
- Время обработки
- Статус каждого job'а

### 3. **Алерты**
- Уведомления о критических ошибках
- Мониторинг успешности рассылок
- Отслеживание блокировок бота

## Профилактика

### 1. **Регулярные проверки**
- Тестирование токена бота
- Проверка доступности Telegram API
- Валидация получателей

### 2. **Мониторинг качества**
- Отслеживание процента успешных отправок
- Анализ типов ошибок
- Уведомления о проблемах

### 3. **Резервные планы**
- Fallback на другие каналы связи
- Автоматические повторы при ошибках
- Уведомления админов о проблемах






