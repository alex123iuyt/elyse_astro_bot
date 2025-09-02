#!/bin/bash

# Скрипт развертывания Elyse Astro Bot на Ubuntu сервере
# Выполнить на сервере: bash deploy.sh

set -e

echo "🚀 Начинаем развертывание Elyse Astro Bot..."

# Обновляем систему
echo "📦 Обновляем систему..."
sudo apt update && sudo apt upgrade -y

# Устанавливаем Node.js 18.x
echo "📦 Устанавливаем Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Устанавливаем дополнительные пакеты
echo "📦 Устанавливаем дополнительные пакеты..."
sudo apt install -y git nginx python3 python3-pip build-essential

# Устанавливаем PM2 глобально
echo "📦 Устанавливаем PM2..."
sudo npm install -g pm2

# Создаем директорию для проекта
echo "📁 Создаем директорию проекта..."
mkdir -p ~/elyse-astro-bot
cd ~/elyse-astro-bot

# Инициализируем git репозиторий (если нужно)
if [ ! -d ".git" ]; then
    git init
fi

echo "✅ Основные зависимости установлены!"
echo "📝 Следующие шаги:"
echo "1. Загрузите файлы проекта в ~/elyse-astro-bot/"
echo "2. Создайте .env файлы"
echo "3. Запустите setup-project.sh"

# Показываем версии
echo ""
echo "🔍 Установленные версии:"
node --version
npm --version
pm2 --version
nginx -v
