#!/bin/bash

# Скрипт настройки проекта Elyse Astro Bot
# Выполнить после загрузки файлов: bash setup-project.sh

set -e

echo "🔧 Настраиваем проект Elyse Astro Bot..."

# Проверяем, что мы в правильной директории
if [ ! -f "main.py" ] || [ ! -d "webapp" ]; then
    echo "❌ Ошибка: Файлы проекта не найдены!"
    echo "Убедитесь, что вы находитесь в директории с main.py и webapp/"
    exit 1
fi

# Устанавливаем Python зависимости для бота
echo "🐍 Устанавливаем Python зависимости..."
pip3 install --user aiogram python-dotenv sqlalchemy aiohttp requests openai apscheduler

# Переходим в webapp директорию
cd webapp

# Устанавливаем Node.js зависимости
echo "📦 Устанавливаем Node.js зависимости..."
npm install

# Создаем .env.local файл для webapp (если не существует)
if [ ! -f ".env.local" ]; then
    echo "📝 Создаем .env.local файл..."
    cat > .env.local << EOF
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Telegram Bot
BOT_TOKEN="your-bot-token"
TELEGRAM_BOT_USERNAME="your-bot-username"

# OpenAI (optional)
OPENAI_API_KEY="your-openai-key"
USE_AI="false"

# Admin
ADMIN_ID="your-telegram-id"
EOF
    echo "⚠️  ВАЖНО: Отредактируйте .env.local файл с вашими настройками!"
fi

# Создаем .env файл для основного бота (если не существует)
cd ..
if [ ! -f ".env" ]; then
    echo "📝 Создаем .env файл для бота..."
    cat > .env << EOF
# Telegram Bot
BOT_TOKEN="your-bot-token"
ADMIN_ID="your-telegram-id"

# Database
DATABASE_URL="sqlite:///bot.db"

# OpenAI (optional)
OPENAI_API_KEY="your-openai-key"
USE_AI="false"

# Email settings (optional)
YANDEX_EMAIL="your-email@yandex.ru"
YANDEX_PASS="your-email-password"

# Timezone
DEFAULT_TZ="Europe/Moscow"

# Mini App URL
MINIAPP_URL="http://your-domain.com"
EOF
    echo "⚠️  ВАЖНО: Отредактируйте .env файл с вашими настройками!"
fi

echo "✅ Проект настроен!"
echo "📝 Следующие шаги:"
echo "1. Отредактируйте .env и webapp/.env.local файлы"
echo "2. Запустите build-and-run.sh"
