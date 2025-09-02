#!/bin/bash

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

echo "✅ Основные зависимости установлены!"
echo "📝 Следующий шаг: bash setup-project.sh"

# Показываем версии
echo ""
echo "🔍 Установленные версии:"
node --version
npm --version
pm2 --version
nginx -v
