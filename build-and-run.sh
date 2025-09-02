#!/bin/bash

# Скрипт сборки и запуска Elyse Astro Bot
# Выполнить после настройки .env файлов: bash build-and-run.sh

set -e

echo "🏗️ Собираем и запускаем Elyse Astro Bot..."

# Проверяем .env файлы
if [ ! -f ".env" ]; then
    echo "❌ Ошибка: .env файл не найден! Запустите setup-project.sh"
    exit 1
fi

if [ ! -f "webapp/.env.local" ]; then
    echo "❌ Ошибка: webapp/.env.local файл не найден! Запустите setup-project.sh"
    exit 1
fi

# Останавливаем существующие процессы PM2 (если есть)
echo "🛑 Останавливаем существующие процессы..."
pm2 delete elyse-bot 2>/dev/null || true
pm2 delete elyse-webapp 2>/dev/null || true

# Переходим в webapp и собираем проект
echo "🏗️ Собираем веб-приложение..."
cd webapp

# Устанавливаем зависимости (на случай если что-то изменилось)
npm install

# Собираем продакшн версию
npm run build

# Запускаем веб-приложение через PM2
echo "🚀 Запускаем веб-приложение..."
pm2 start npm --name "elyse-webapp" -- start

# Возвращаемся в корневую директорию
cd ..

# Запускаем Telegram бота через PM2
echo "🤖 Запускаем Telegram бота..."
pm2 start python3 --name "elyse-bot" -- main.py

# Сохраняем конфигурацию PM2
pm2 save
pm2 startup

echo "✅ Приложение запущено!"
echo ""
echo "📊 Статус процессов:"
pm2 status

echo ""
echo "📝 Полезные команды:"
echo "pm2 status          - показать статус процессов"
echo "pm2 logs elyse-bot  - логи Telegram бота"
echo "pm2 logs elyse-webapp - логи веб-приложения"
echo "pm2 restart all     - перезапустить все процессы"
echo "pm2 stop all        - остановить все процессы"

echo ""
echo "🌐 Веб-приложение доступно на порту 3000"
echo "Настройте Nginx для проксирования на ваш домен"
