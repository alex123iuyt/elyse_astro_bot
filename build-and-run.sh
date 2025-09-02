#!/bin/bash

echo "🏗️ Собираем и запускаем Elyse Astro Bot..."

# Останавливаем существующие процессы PM2
echo "🛑 Останавливаем существующие процессы..."
pm2 delete elyse-bot 2>/dev/null || true
pm2 delete elyse-webapp 2>/dev/null || true

# Переходим в webapp и собираем проект
echo "🏗️ Собираем веб-приложение..."
cd webapp

# Устанавливаем зависимости
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
echo "🌐 Веб-приложение доступно на:"
echo "http://212.22.68.64:3000"
