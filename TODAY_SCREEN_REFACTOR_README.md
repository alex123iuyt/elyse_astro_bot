# Today Screen Refactor - README

## Обзор изменений

Экран "Сегодня" был полностью переработан согласно требованиям:
- Убрана отдельная навигация "Луна" из нижнего меню
- Добавлены 4 основных блока: Stories, Forecast, Lunar Calendar, Banner
- Реализованы полноэкранные сторис с прогресс-барами
- Добавлены bottom sheet для детального просмотра
- Интегрирован лунный календарь в основной экран

## Структура компонентов

### 1. Stories (`webapp/components/today/Stories.tsx`)
- **Функционал**: Карусель с тремя типами сторис (Daily Tips, Do/Don't, Today's Luck)
- **Особенности**: 
  - Полноэкранный режим просмотра
  - Прогресс-бары сверху
  - Свайпы влево/вправо
  - Автоматическое переключение слайдов
- **API**: `GET /api/content/stories?date=YYYY-MM-DD&sign=USER_SIGN`

### 2. Forecast (`webapp/components/today/Forecast.tsx`)
- **Функционал**: Основной прогноз дня с детальной информацией
- **Особенности**:
  - Карточка с заголовком "Navigating through change"
  - Секции Focus (зеленый) и Troubles (красный)
  - Bottom sheet с деталями транзитов
- **API**: `GET /api/content/forecast?date=YYYY-MM-DD&sign=USER_SIGN`

### 3. Lunar Calendar (`webapp/components/today/LunarCalendar.tsx`)
- **Функционал**: Лунный календарь с фазами и деталями
- **Особенности**:
  - Вкладки Today/Tomorrow/Calendar
  - Иконки фаз луны
  - Bottom sheet с Moon Impact и Quick Overview
- **API**: `GET /api/content/lunar/month?date=YYYY-MM-DD`

### 4. Banner (`webapp/components/today/Banner.tsx`)
- **Функционал**: Баннер для чата с астрологом
- **Особенности**:
  - Яркий дизайн с CTA кнопкой
  - Deeplink в чат с оператором
- **API**: `GET /api/content/banner?type=CHAT_ASTROLOGER`

## API Endpoints

### Stories API
```typescript
GET /api/content/stories
Query params:
- date: YYYY-MM-DD (required)
- sign: USER_SIGN (optional, default: SAGITTARIUS)
- tz: timezone (optional, default: Europe/Amsterdam)

Response:
{
  success: true,
  data: Story[],
  meta: { date, sign, timezone, total, source }
}
```

### Forecast API
```typescript
GET /api/content/forecast
Query params:
- date: YYYY-MM-DD (required)
- sign: USER_SIGN (optional, default: SAGITTARIUS)
- tz: timezone (optional, default: Europe/Amsterdam)

Response:
{
  success: true,
  data: ForecastData,
  meta: { date, sign, timezone, source }
}
```

### Lunar Calendar API
```typescript
GET /api/content/lunar/month
Query params:
- date: YYYY-MM-DD (required)
- tz: timezone (optional, default: Europe/Amsterdam)

Response:
{
  success: true,
  data: LunarData,
  meta: { date, timezone, source }
}
```

### Banner API
```typescript
GET /api/content/banner
Query params:
- type: BANNER_TYPE (optional, default: CHAT_ASTROLOGER)
- tz: timezone (optional, default: Europe/Amsterdam)

Response:
{
  success: true,
  data: BannerData,
  meta: { type, timezone, source }
}
```

## Обновленная навигация

### Нижнее меню (BottomNav.tsx)
```typescript
const items = [
  { href: '/today', label: 'Today', icon: '🎯' },
  { href: '/advisors', label: 'Advisors', icon: '⭐' },
  { href: '/readings', label: 'Readings', icon: '🔮' },
  { href: '/compatibility', label: 'Compatibility', icon: '💕' },
  { href: '/birth-chart', label: 'Birth Chart', icon: '✨' }
];
```

**Изменения**: Убран пункт "Луна", изменены названия на английский

## Типы данных

### Story
```typescript
interface Story {
  id: string;
  type: 'DAILY_TIPS' | 'DO_DONT' | 'TODAYS_LUCK';
  title: string;
  category: string;
  slides: StorySlide[];
  publishedAt: string;
}
```

### ForecastData
```typescript
interface ForecastData {
  id: string;
  title: string;
  transitsCount: number;
  transits: Transit[];
  focus: FocusItem[];
  troubles: TroubleItem[];
  emotionalShifts: { title: string; description: string };
  careerDynamics: { title: string; description: string };
  publishedAt: string;
}
```

### LunarData
```typescript
interface LunarData {
  currentPhase: { name: string; percentage: number; sign: string; date: string };
  monthRange: { start: string; end: string };
  phases: MoonPhase[];
}
```

### BannerData
```typescript
interface BannerData {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaAction: string;
  ctaLink: string;
}
```

## Fallback данные

Все компоненты имеют fallback данные, которые отображаются если CMS недоступен:
- **Stories**: 3 базовых сторис (Love, Balance, Fortune)
- **Forecast**: Прогноз "Navigating through change" с транзитами
- **Lunar**: Текущая фаза "Waxing Crescent" в Скорпионе
- **Banner**: Баннер "Astrocartography" с CTA "Get the Answer"

## Развертывание

### 1. Установка зависимостей
```bash
cd webapp
npm install
# или
yarn install
```

### 2. Проверка API endpoints
```bash
# Проверьте что все API endpoints доступны
curl http://localhost:3000/api/content/stories?date=2025-01-28
curl http://localhost:3000/api/content/forecast?date=2025-01-28
curl http://localhost:3000/api/content/lunar/month?date=2025-01-28
curl http://localhost:3000/api/content/banner?type=CHAT_ASTROLOGER
```

### 3. Запуск приложения
```bash
npm run dev
# или
yarn dev
```

### 4. Проверка экрана Today
Откройте `http://localhost:3000/today` и убедитесь что:
- Отображаются все 4 блока
- Сторисы открываются полноэкранно
- Forecast открывает bottom sheet
- Lunar Calendar работает с вкладками
- Banner кликабелен

## CMS интеграция

### Content Types
В CMS должны быть настроены следующие типы контента:
- `STORIES` - для сторис
- `DAILY_FORECAST` - для прогнозов
- `BANNER` - для баннеров

### Payload структура
Каждый тип контента должен иметь соответствующую структуру payload в поле `body` (JSON).

## Тестирование

### Unit тесты
```bash
npm run test
```

### E2E тесты
```bash
npm run test:e2e
```

### Ручное тестирование
1. Проверьте загрузку fallback данных при недоступности CMS
2. Протестируйте все интерактивные элементы
3. Убедитесь в корректности bottom sheet
4. Проверьте адаптивность на разных экранах

## Возможные проблемы

### 1. Prisma ошибки
Если возникают ошибки с Prisma, убедитесь что:
- База данных доступна
- Схема синхронизирована
- Переменные окружения настроены

### 2. API ошибки
Проверьте:
- Логи сервера
- Статус ответов API
- Корректность параметров запросов

### 3. Стили
Убедитесь что Tailwind CSS правильно настроен и все классы применяются.

## Дальнейшее развитие

### Планируемые улучшения
1. Полноценный Story Viewer с анимациями
2. Детальный лунный календарь с сеткой месяца
3. Интеграция с реальными астрономическими данными
4. Кэширование контента для офлайн режима
5. Push-уведомления для ежедневных прогнозов

### Оптимизация
1. Lazy loading для изображений
2. Виртуализация для больших списков
3. Service Worker для кэширования
4. Оптимизация bundle size

## Контакты

При возникновении проблем или вопросов обращайтесь к команде разработки.


