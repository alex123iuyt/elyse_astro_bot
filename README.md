# 🔮 Elyse Astro Bot

Астрологический Telegram бот с веб-приложением на Next.js.

## 🚀 Быстрый старт

### Локальная разработка

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/alex123iuyt/elyse_astro_bot.git
   cd elyse_astro_bot
   ```

2. **Настройте окружение для бота:**
   ```bash
   cp .env.example .env
   nano .env  # Добавьте свой BOT_TOKEN и ADMIN_ID
   ```

3. **Установите Python зависимости:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Запустите бота:**
   ```bash
   python main.py
   ```

5. **Настройте веб-приложение:**
   ```bash
   cd webapp
   npm install
   cp .env.example .env.local
   nano .env.local  # Настройте переменные окружения
   ```

6. **Запустите веб-приложение:**
   ```bash
   npm run dev
   ```

### Развертывание на сервере

1. **Запустите скрипт установки зависимостей:**
   ```bash
   sudo bash deploy.sh
   ```

2. **Настройте проект:**
   ```bash
   bash setup-project.sh
   ```

3. **Отредактируйте конфигурационные файлы:**
   ```bash
   nano .env
   nano webapp/.env.local
   ```

4. **Соберите и запустите:**
   ```bash
   bash build-and-run.sh
   ```

## 📁 Структура проекта

```
elyse_astro_bot/
├── main.py              # Основной файл Telegram бота
├── requirements.txt     # Python зависимости
├── .env.example        # Пример конфигурации бота
├── deploy.sh           # Скрипт установки зависимостей
├── setup-project.sh    # Скрипт настройки проекта
├── build-and-run.sh    # Скрипт сборки и запуска
└── webapp/             # Next.js веб-приложение
    ├── app/            # Страницы приложения
    ├── components/     # React компоненты
    ├── package.json    # Node.js зависимости
    └── .env.local      # Конфигурация веб-приложения
```

## ⚙️ Конфигурация

### Переменные окружения бота (.env)

```env
BOT_TOKEN=your_bot_token_here
ADMIN_ID=your_telegram_id_here
MINIAPP_URL=http://localhost:3000
DATABASE_URL=sqlite:///bot.db
DEFAULT_TZ=Europe/Moscow
```

### Переменные окружения веб-приложения (webapp/.env.local)

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
BOT_TOKEN="your-bot-token"
TELEGRAM_BOT_USERNAME="your-bot-username"
```

## 🛠️ Технологии

- **Backend:** Python, aiogram
- **Frontend:** Next.js 14, React, TypeScript
- **Стили:** Tailwind CSS
- **База данных:** SQLite, Prisma ORM
- **Деплой:** PM2, Nginx

## 📝 Лицензия

MIT License
