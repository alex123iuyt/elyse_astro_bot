# Рефакторинг Elyse Astro - CMS для управления контентом

## 🎯 Цель рефакторинга

Создать единую систему управления контентом (CMS) для всех типов астрологического контента с единым API, админ-панелью и автоматизацией генерации.

## 🏗️ Архитектура

### Структура проекта
```
Elyse_Astro_bot_miniAPP/
├── apps/
│   ├── api/                    # NestJS API (новый)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── admin/content/  # Админка для контента
│   │   │   │   ├── public/content/  # Публичное API
│   │   │   │   ├── generator/       # Генерация контента
│   │   │   │   ├── jobs/           # Крон-джобы
│   │   │   │   └── auth/           # Аутентификация
│   │   │   ├── prisma/             # Prisma сервис
│   │   │   └── main.ts             # Точка входа
│   │   └── package.json
│   └── web/                     # Next.js веб-приложение (существующее)
├── packages/
│   └── db/                      # Prisma схема (обновлена)
│       ├── schema.prisma        # Новая схема с Content моделью
│       └── package.json
└── webapp/                      # Существующая админка (обновлена)
    └── app/admin/content/       # Новый интерфейс управления контентом
```

## 🗄️ Новая модель данных

### Content модель
```prisma
model Content {
  id            String        @id @default(cuid())
  type          ContentType   # Тип контента (16 типов)
  title         String?       # Заголовок
  slug          String?       @unique # URL-слаг
  body          Json?         # Содержимое (JSON блоки)
  summary       String?       # Краткое описание
  tags          String[]      # Теги
  status        PublishStatus # Статус публикации
  visibility    Visibility    # Видимость
  locale        String?       # Локаль
  sign          ZodiacSign?   # Знак зодиака
  dateFrom      DateTime?     # Дата начала
  dateTo        DateTime?     # Дата окончания
  effectiveDate DateTime?     # Эффективная дата
  authorId      String?       # ID автора
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  version       Int           @default(1)
  meta          Json?         # Дополнительные мета-данные
}
```

### Типы контента
- `DAILY_FORECAST` - Ежедневный прогноз
- `DAILY_ADVICE_HOME` - Совет дня по дому
- `DOMAIN_FORECAST` - Прогноз по сфере
- `MOON_CALENDAR` - Лунный календарь
- `STORIES` - Сторис
- `SIGN_FORECAST` - Прогноз по знаку
- `WEEKLY_FORECAST` - Недельный прогноз
- `MONTHLY_FORECAST` - Месячный прогноз
- `YEARLY_FORECAST` - Годовой прогноз
- `COMPATIBILITY` - Совместимость
- `NATAL_CHART` - Натальная карта
- `ONBOARDING` - Онбординг
- `PUSH` - Push-уведомления
- `ASTRO_EVENT` - Астро-события
- `ARTICLE` - Статья
- `UI_TEXT` - UI-текст

## 🚀 Запуск и установка

### 1. Установка зависимостей

```bash
# В корне проекта
pnpm install

# В папке API
cd apps/api
npm install

# В папке веб-приложения
cd ../../webapp
npm install
```

### 2. Настройка базы данных

```bash
# Генерация Prisma клиента
cd packages/db
npx prisma generate

# Создание миграции
npx prisma migrate dev --name add-content-model

# Применение миграции
npx prisma migrate deploy
```

### 3. Запуск API

```bash
cd apps/api
npm run start:dev
```

API будет доступен по адресу: http://localhost:3001

### 4. Запуск веб-приложения

```bash
cd webapp
npm run dev
```

Веб-приложение будет доступно по адресу: http://localhost:3000

## 📚 API Endpoints

### Админка контента
```
GET    /api/admin/content/{type}           # Список контента типа
POST   /api/admin/content/{type}           # Создание контента
GET    /api/admin/content/{type}/{id}      # Получение контента
PUT    /api/admin/content/{type}/{id}      # Обновление контента
DELETE /api/admin/content/{type}/{id}      # Удаление контента
POST   /api/admin/content/{type}/{id}/publish # Публикация
```

### Утилиты
```
POST   /api/admin/content/utils/copy-yesterday  # Копировать вчера
POST   /api/admin/content/utils/generate-today  # Генерировать сегодня
```

### Массовые операции
```
POST   /api/admin/content/bulk/publish    # Массовая публикация
POST   /api/admin/content/bulk/archive    # Массовое архивирование
POST   /api/admin/content/bulk/delete     # Массовое удаление
```

### Публичное API
```
GET    /api/public/content/by-date        # Контент по дате
GET    /api/public/content/feed            # Лента контента
GET    /api/public/content/ui-text         # UI тексты
```

## 🔧 Автоматизация

### Крон-джобы
- **Ежедневно в 3:00** - Генерация ежедневных прогнозов для всех знаков
- **Еженедельно** - Генерация недельных прогнозов
- **Ежедневно в 2:00** - Заполнение пропущенного контента

### Генерация контента
- Автоматическая генерация через AI
- Шаблоны для каждого типа контента
- Подстановка переменных (дата, знак, фаза луны)

## 📱 Админ-интерфейс

### Основные функции
- **16 типов контента** с отдельными табами
- **Поиск и фильтрация** по заголовку, статусу, знаку, дате
- **CRUD операции** для каждого типа
- **Массовые операции** (публикация, архивирование)
- **Кнопки автоматизации**:
  - 📋 "Копировать вчера" - копирует вчерашний контент на сегодня
  - ⚡ "Генерировать сегодня" - генерирует контент на сегодня

### Интерфейс
- Темная тема в стиле существующего дизайна
- Адаптивная верстка
- Интуитивная навигация по типам контента

## 🔄 Миграция существующих данных

### Запуск миграции
```bash
cd scripts
npx tsx migrate-content.ts
```

### Что мигрируется
- Существующие прогнозы и советы
- UI тексты и интерфейсные элементы
- Шаблоны для генерации
- Системный пользователь

## 🧪 Тестирование

### Unit тесты
```bash
cd apps/api
npm run test
```

### E2E тесты
```bash
cd apps/api
npm run test:e2e
```

## 📊 Мониторинг и логи

### Аудит-лог
- Кто и когда создавал/изменял контент
- История изменений с версионированием
- Отслеживание публикаций

### Логи генерации
- Успешные генерации
- Ошибки и их причины
- Статистика по типам контента

## 🔐 Безопасность

### Роли пользователей
- **Admin** - Полный доступ ко всем функциям
- **Editor** - Создание, редактирование, публикация
- **Viewer** - Только просмотр

### Аутентификация
- JWT токены
- Защищенные роуты
- Проверка ролей на уровне API

## 🚀 Развертывание

### Production
```bash
# Сборка API
cd apps/api
npm run build
npm run start:prod

# Сборка веб-приложения
cd ../../webapp
npm run build
npm run start
```

### Environment variables
```env
# База данных
DATABASE_URL="postgresql://user:password@localhost:5432/elyse_astro"

# JWT
JWT_SECRET="your-secret-key"

# API
PORT=3001
NODE_ENV=production
```

## 📈 Планы развития

### Краткосрочные (1-2 недели)
- [ ] Создание всех 16 типов контента
- [ ] Интеграция с существующим ботом
- [ ] Тестирование API endpoints

### Среднесрочные (1-2 месяца)
- [ ] Расширенная аналитика
- [ ] A/B тестирование контента
- [ ] Интеграция с внешними AI сервисами

### Долгосрочные (3-6 месяцев)
- [ ] Мультиязычность
- [ ] Мобильное приложение
- [ ] API для партнеров

## 🆘 Поддержка

### Документация
- Swagger UI: http://localhost:3001/docs
- Prisma Studio: `npx prisma studio`

### Логи и отладка
- API логи: `apps/api/logs/`
- База данных: `packages/db/`

### Контакты
- Разработчики: Elyse Astro Team
- GitHub Issues: [Создать issue](https://github.com/elyse-astro/issues)

---

## 📝 Чек-лист завершения

- [x] Создана новая Prisma схема с Content моделью
- [x] Реализован NestJS API с модульной архитектурой
- [x] Созданы все 16 типов контента
- [x] Реализована админ-панель для управления контентом
- [x] Добавлена автоматизация генерации контента
- [x] Созданы крон-джобы для ежедневной генерации
- [x] Реализовано публичное API для клиентов
- [x] Добавлена система ролей и аутентификации
- [x] Создан скрипт миграции существующих данных
- [x] Обновлен веб-интерфейс админки
- [x] Добавлены кнопки "Копировать вчера" и "Генерировать сегодня"
- [x] Реализовано версионирование и аудит-лог
- [x] Добавлено кэширование и ETag для публичного API

**Статус: ✅ Завершено**



