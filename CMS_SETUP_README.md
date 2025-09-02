# Elyse CMS - Система управления контентом

Полноценная CMS для астрологического проекта с поддержкой всех типов контента, версионированием, расписаниями и AI-генерацией.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
# В корневой директории
pnpm install

# В webapp
cd webapp
pnpm install
```

### 2. Настройка базы данных

```bash
# Создайте PostgreSQL базу данных
createdb elyse_cms

# Настройте .env файл в webapp/
cp .env.example .env
# Отредактируйте DATABASE_URL

# Примените миграции
cd webapp
pnpm db:push
```

### 3. Инвентаризация существующего контента

```bash
# В корневой директории
cd scripts
pnpm install
pnpm run inventory
```

Это создаст файл `.cache/content-inventory.json` с найденным контентом.

### 4. Миграция контента в CMS

```bash
# В корневой директории
cd scripts
pnpm run migrate-content
```

### 5. Запуск проекта

```bash
# В корневой директории
npm run dev
```

Проект будет доступен на http://localhost:3001

## 🏗️ Архитектура

### База данных (Prisma)

- **ContentItem** - основная сущность контента
- **ContentVersion** - версионирование контента
- **MediaAsset** - медиа файлы
- **PushTemplate** - шаблоны push-уведомлений
- **PushJob** - задачи отправки
- **AuditLog** - аудит операций
- **User** - пользователи с ролями

### Типы контента

- **DAILY_FORECAST*** - ежедневные прогнозы
- **WEEKLY_FORECAST*** - недельные прогнозы
- **MONTHLY_FORECAST*** - месячные прогнозы
- **YEARLY_FORECAST*** - годовые прогнозы
- **STORYLINE** - сторис и слайды
- **COMPATIBILITY** - совместимость знаков
- **NATAL_TEMPLATE** - натальные шаблоны
- **ONBOARDING_STEP** - шаги онбординга
- **PUSH_TEMPLATE** - push-уведомления
- **ASTRO_EVENT** - астро-события
- **ARTICLE** - статьи и гайды
- **UI_COPY** - UI тексты

### API Endpoints

- `GET /api/content/daily` - ежедневные прогнозы
- `GET /api/content/stories` - сторис
- `GET /api/content/compatibility` - совместимость
- `GET /api/content/natal` - натальные шаблоны
- `GET /api/content/period` - периодические прогнозы
- `GET /api/push/templates` - push-шаблоны

## 🔧 Конфигурация

### Переменные окружения

```bash
# Обязательные
DATABASE_URL="postgresql://user:pass@localhost:5432/elyse_cms"
NEXTAUTH_SECRET="your-secret-key"

# Опциональные
GENERATOR="manual" # manual | openai
OPENAI_API_KEY="" # для AI-генерации
TZ="Europe/Amsterdam"
LOCALE="ru"
```

### Генерация контента

По умолчанию используется ручной режим (`GENERATOR=manual`). Для включения OpenAI:

```bash
GENERATOR=openai
OPENAI_API_KEY=sk-...
```

## 📱 Админка

### Доступ

- **ADMIN** - полный доступ
- **EDITOR** - создание/редактирование контента
- **VIEWER** - только просмотр

### Основные функции

- 📝 Создание и редактирование контента
- 🎯 Настройка таргетинга (знак, сфера, дата)
- ⏰ Планирование публикаций
- 📊 Версионирование и откаты
- 🔍 Поиск и фильтрация
- 📱 Конструктор сторис
- 🔔 Управление push-уведомлениями

## 🚀 Развертывание

### Development

```bash
npm run dev
```

### Production

```bash
# Сборка
npm run build

# Запуск
npm start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 📊 Мониторинг

### Аудит

Все операции с контентом логируются в `AuditLog`:
- Создание/редактирование
- Публикация/архивирование
- Изменение статусов
- Доступ к контенту

### Метрики

- Количество элементов по типам
- Статистика публикаций
- Популярность контента
- Производительность API

## 🔒 Безопасность

### Аутентификация

- NextAuth.js с JWT
- Ролевая модель доступа
- Защищенные API endpoints

### Валидация

- Zod схемы для всех типов контента
- Проверка входных данных
- Санитизация контента

### Rate Limiting

- Ограничение запросов к API
- Защита от DDoS
- Мониторинг подозрительной активности

## 🧪 Тестирование

### Запуск тестов

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Проверка линтера
npm run lint

# Проверка типов
npm run type-check
```

### ESLint правила

- `no-hardcoded-content` - запрет жестко прошитого контента
- TypeScript best practices
- Code quality rules

## 📚 Документация

### API Reference

Полная документация API доступна по адресу `/api/docs` (Swagger UI).

### Примеры использования

Смотрите `examples/` директорию для примеров интеграции.

## 🤝 Contributing

1. Fork репозитория
2. Создайте feature branch
3. Следуйте ESLint правилам
4. Добавьте тесты
5. Создайте Pull Request

## 📄 Лицензия

MIT License - см. LICENSE файл.

## 🆘 Поддержка

- 📧 Email: support@elyse-cms.com
- 📖 Документация: `/docs`
- 🐛 Issues: GitHub Issues
- 💬 Discord: Elyse Community

## 🔄 Changelog

### v1.0.0 (2025-01-23)
- 🎉 Первый релиз CMS
- 📝 Полная поддержка всех типов контента
- 🤖 AI-генерация контента
- 📱 Админ-панель
- 🔒 Ролевая система доступа
- 📊 Аудит и мониторинг








