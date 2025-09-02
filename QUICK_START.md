# 🚀 Quick Start - Today Screen Refactor

## Быстрый запуск

### 1. Установка зависимостей
```bash
cd webapp
npm install
```

### 2. Запуск приложения
```bash
npm run dev
```

### 3. Проверка API
```bash
# В новом терминале
node scripts/test-api.js
```

### 4. Открытие в браузере
Перейдите на `http://localhost:3000/today`

## ✅ Что должно работать

- **Stories**: 3 карточки с полноэкранным просмотром
- **Forecast**: Карточка "Navigating through change" с bottom sheet
- **Lunar Calendar**: Лунный календарь с вкладками
- **Banner**: Баннер "Astrocartography" с CTA

## 🔧 Если что-то не работает

### API недоступны
```bash
# Проверьте логи сервера
npm run dev
```

### Стили не применяются
```bash
# Перезапустите Tailwind
npm run build:css
```

### Компоненты не отображаются
Проверьте консоль браузера на ошибки JavaScript

## 📱 Тестирование

1. **Stories**: Кликните на карточку → должен открыться полноэкранный просмотр
2. **Forecast**: Кликните "More Insights" → должен открыться bottom sheet
3. **Lunar**: Переключайте вкладки Today/Tomorrow/Calendar
4. **Banner**: Кликните "Get the Answer" → должен перейти на /advisors

## 🆘 Проблемы

- **Fallback данные**: Если CMS недоступен, показываются базовые данные
- **Ошибки API**: Проверьте что сервер запущен и база доступна
- **Стили**: Убедитесь что Tailwind CSS правильно настроен

## 📞 Поддержка

См. `TODAY_SCREEN_REFACTOR_README.md` для детальной документации





