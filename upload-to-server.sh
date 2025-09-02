#!/bin/bash

# Скрипт для загрузки файлов на сервер
# Выполнить локально: bash upload-to-server.sh

set -e

SERVER="212.22.68.64"
USER="elyseastro"
REMOTE_DIR="~/elyse-astro-bot"

echo "📤 Загружаем файлы на сервер $SERVER..."

# Создаем архив проекта (исключая node_modules и другие ненужные файлы)
echo "📦 Создаем архив проекта..."
tar -czf elyse-project.tar.gz \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    --exclude="*.log" \
    --exclude=bot.db \
    --exclude=dev.db \
    --exclude=.env \
    --exclude=.env.local \
    --exclude=.env.production \
    main.py \
    webapp/ \
    deploy.sh \
    setup-project.sh \
    build-and-run.sh \
    nginx-config.sh \
    README.md

echo "📤 Загружаем архив на сервер..."
scp elyse-project.tar.gz $USER@$SERVER:~/

echo "🔧 Распаковываем архив на сервере..."
ssh $USER@$SERVER << 'EOF'
    # Создаем директорию проекта
    mkdir -p ~/elyse-astro-bot
    cd ~/elyse-astro-bot
    
    # Распаковываем архив
    tar -xzf ~/elyse-project.tar.gz
    
    # Удаляем архив
    rm ~/elyse-project.tar.gz
    
    # Делаем скрипты исполняемыми
    chmod +x *.sh
    
    echo "✅ Файлы успешно загружены!"
    echo "📁 Проект находится в: ~/elyse-astro-bot"
    echo ""
    echo "📝 Следующие шаги:"
    echo "1. bash deploy.sh - установка зависимостей"
    echo "2. bash setup-project.sh - настройка проекта"
    echo "3. Отредактируйте .env файлы"
    echo "4. bash build-and-run.sh - сборка и запуск"
    echo "5. bash nginx-config.sh your-domain.com - настройка Nginx"
EOF

# Удаляем локальный архив
rm elyse-project.tar.gz

echo "✅ Загрузка завершена!"
echo ""
echo "🔗 Подключитесь к серверу:"
echo "ssh $USER@$SERVER"
echo ""
echo "📝 И выполните команды по порядку:"
echo "cd ~/elyse-astro-bot"
echo "bash deploy.sh"
