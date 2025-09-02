#!/bin/bash

echo "🔧 Настраиваем проект Elyse Astro Bot..."

# Устанавливаем Python зависимости для бота
echo "🐍 Устанавливаем Python зависимости..."
pip3 install --user -r requirements.txt

# Переходим в webapp директорию
cd webapp

# Устанавливаем Node.js зависимости
echo "📦 Устанавливаем Node.js зависимости..."
npm install

# Создаем .env.local файл для webapp
if [ ! -f ".env.local" ]; then
    echo "📝 Создаем .env.local файл..."
    cat > .env.local << 'ENVEOF'
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-make-it-long-and-random-12345678"
NEXTAUTH_URL="http://212.22.68.64:3000"

# Telegram Bot
BOT_TOKEN="your-bot-token"
TELEGRAM_BOT_USERNAME="your-bot-username"
ENVEOF
fi

# Создаем .env файл для основного бота
cd ..
if [ ! -f ".env" ]; then
    echo "📝 Создаем .env файл для бота..."
    cat > .env << 'ENVEOF'
# Telegram Bot
BOT_TOKEN="your-bot-token"
ADMIN_ID="your-telegram-id"

# Database
DATABASE_URL="sqlite:///bot.db"

# Mini App URL
MINIAPP_URL="http://212.22.68.64:3000"

# Timezone
DEFAULT_TZ="Europe/Moscow"
ENVEOF
fi

echo "✅ Проект настроен!"
echo "📝 Следующие шаги:"
echo "1. nano .env - отредактируйте настройки бота"
echo "2. nano webapp/.env.local - отредактируйте настройки веб-приложения"
echo "3. bash build-and-run.sh - соберите и запустите"