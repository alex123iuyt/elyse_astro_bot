# CMS Setup Guide - Elyse Astro Bot

## Обзор изменений

Этот проект был обновлен для поддержки новых типов контента и интеграции с CMS:

- **DAILY_TIP_DOMAIN** - Советы дня по доменам (любовь, баланс, удача)
- **DAILY_FORECAST_DOMAIN** - Прогнозы по сферам (общий, любовь, карьера)
- **LUNAR_TODAY** - Лунный календарь на сегодня
- **STORYLINE** - Сторис с размещением

## Установка и настройка

### 1. Переменные окружения

Создайте файл `.env.local` в корне `webapp/`:

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/app"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Content Generator
GENERATOR="manual"
OPENAI_API_KEY=""

# Optional: OpenAI Configuration
OPENAI_MODEL="gpt-3.5-turbo"
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# App Configuration
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Обновление базы данных

```bash
# Применить новые схемы
pnpm run db:push

# Запустить миграцию контента
pnpm run migrate-content
```

### 3. Запуск приложения

```bash
# Установка зависимостей
pnpm install

# Запуск в режиме разработки
pnpm run dev
```

## Новые API эндпоинты

### Публичные API (без авторизации)

#### GET /api/content/daily-tips
Получение советов дня по доменам.

**Параметры:**
- `date` (опционально) - дата в формате YYYY-MM-DD
- `tz` (опционально) - часовой пояс, по умолчанию Europe/Amsterdam

**Ответ:**
```json
{
  "success": true,
  "data": {
    "love": [...],
    "balance": [...],
    "luck": [...]
  }
}
```

#### GET /api/content/daily-forecast
Получение прогнозов по сферам.

**Параметры:**
- `date` (опционально) - дата в формате YYYY-MM-DD
- `domains` (опционально) - список доменов через запятую
- `tz` (опционально) - часовой пояс

**Ответ:**
```json
{
  "success": true,
  "data": {
    "general": "Текст прогноза...",
    "love": "Текст прогноза...",
    "career": "Текст прогноза..."
  }
}
```

#### GET /api/content/lunar-today
Получение лунного календаря на сегодня.

**Параметры:**
- `date` (опционально) - дата в формате YYYY-MM-DD
- `tz` (опционально) - часовой пояс

**Ответ:**
```json
{
  "success": true,
  "data": {
    "phaseName": "Растущая Луна",
    "phasePct": 75,
    "bestTime": { "from": "09:00", "to": "12:00" },
    "avoidTime": { "from": "15:00", "to": "18:00" },
    "monthDay": 15,
    "advice": "Совет по лунному календарю...",
    "moonSign": "Скорпион"
  }
}
```

#### GET /api/content/stories
Получение сторис по размещению.

**Параметры:**
- `placement` (опционально) - размещение: today, home, promo
- `tz` (опционально) - часовой пояс

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": "story-id",
      "title": "Название истории",
      "placement": "today",
      "slides": [...],
      "autoPlay": true,
      "loop": false
    }
  ]
}
```

### Админские API (требуют авторизации)

#### POST /api/admin/generate/today
Генерация ежедневного контента.

**Требования:** Роль EDITOR или ADMIN

**Тело запроса:**
```json
{
  "date": "2025-01-27",
  "tz": "Europe/Amsterdam"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Generated 7 content items for 2025-01-27",
  "data": {
    "createdItems": [...],
    "date": "2025-01-27",
    "timezone": "Europe/Amsterdam"
  }
}
```

## Генераторы контента

### ManualGenerator (по умолчанию)
Создает пустые структуры для ручного заполнения.

### OpenAIContentGenerator (опционально)
Для использования OpenAI API установите:
```bash
GENERATOR=openai
OPENAI_API_KEY=your-api-key
```

## Структура данных

### DAILY_TIP_DOMAIN
```typescript
{
  type: 'DAILY_TIP_DOMAIN',
  payload: {
    domain: 'love' | 'balance' | 'luck',
    title: string,
    subtitle?: string,
    icon?: string,
    text: string
  }
}
```

### DAILY_FORECAST_DOMAIN
```typescript
{
  type: 'DAILY_FORECAST_DOMAIN',
  payload: {
    domain: 'general' | 'love' | 'career' | 'money' | 'health',
    text: string,
    mood?: 'positive' | 'neutral' | 'challenging',
    priority?: 'low' | 'medium' | 'high'
  }
}
```

### LUNAR_TODAY
```typescript
{
  type: 'LUNAR_TODAY',
  payload: {
    phaseName: string,
    phasePct: number,
    bestTime: { from: string, to: string },
    avoidTime: { from: string, to: string },
    monthDay: number,
    advice: string,
    moonSign?: string
  }
}
```

### STORYLINE
```typescript
{
  type: 'STORYLINE',
  payload: {
    placement: 'today' | 'home' | 'promo',
    slides: Array<{
      kind: 'text' | 'image' | 'video',
      text?: string,
      mediaId?: string,
      durationMs: number,
      backgroundColor?: string,
      textColor?: string
    }>,
    autoPlay: boolean,
    loop: boolean,
    activeFrom?: string,
    activeTo?: string
  }
}
```

## Админка

### Управление контентом
- Создание/редактирование контента всех типов
- Кнопка "Копировать вчера" для быстрого создания черновиков
- Кнопка "Генерировать сегодня" для массовой генерации
- AI-генерация черновиков (Manual/OpenAI)

### Фильтрация и поиск
- По типу контента
- По статусу (Черновик/Опубликовано/Архив)
- Поиск по заголовку и содержимому

## Миграция существующих данных

Скрипт `migrate-content.ts` автоматически:

1. Находит все записи типа `DAILY_FORECAST`
2. Создает новые записи типов `DAILY_TIP_DOMAIN`, `DAILY_FORECAST_DOMAIN`, `LUNAR_TODAY`
3. Создает сторис-шаблон для страницы "Сегодня"
4. Создает сид-данные на сегодня и завтра

## Навигация и авторизация

### Middleware
- Защищает только роуты `/admin/*`
- Публичные API доступны без авторизации
- Редирект на `/api/auth/signin` для неавторизованных пользователей

### Роли пользователей
- **VIEWER** - только просмотр
- **EDITOR** - создание/редактирование контента
- **ADMIN** - полный доступ

## Тестирование

### Проверка API
```bash
# Проверка публичных API
curl "http://localhost:3000/api/content/daily-tips?date=2025-01-27"

# Проверка админских API (требует авторизации)
curl -X POST "http://localhost:3000/api/admin/generate/today" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-01-27","tz":"Europe/Amsterdam"}'
```

### Проверка фронтенда
1. Откройте страницу "Сегодня" - должен загрузиться контент из CMS
2. Войдите в админку - создайте новый контент
3. Опубликуйте контент - проверьте обновление на фронтенде

## Troubleshooting

### Ошибки базы данных
```bash
# Сброс базы
pnpm run db:push --force-reset

# Пересоздание клиента
pnpm run db:generate
```

### Ошибки авторизации
1. Проверьте `NEXTAUTH_SECRET` и `NEXTAUTH_URL`
2. Убедитесь, что пользователь имеет роль EDITOR/ADMIN
3. Проверьте cookies в браузере

### Ошибки генерации контента
1. Проверьте `GENERATOR` в .env
2. Для OpenAI проверьте `OPENAI_API_KEY`
3. Проверьте логи сервера

## Дальнейшее развитие

1. **Расширенные типы контента** - добавление новых доменов и категорий
2. **Планировщик контента** - автоматическая публикация по расписанию
3. **Аналитика** - отслеживание популярности контента
4. **Мультиязычность** - поддержка разных языков
5. **A/B тестирование** - тестирование разных версий контента




