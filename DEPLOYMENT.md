# 🚀 Инструкция по развертыванию Elyse Astro Bot на Ubuntu сервере

## 📋 Предварительные требования

- Ubuntu сервер (18.04+)
- Доступ по SSH
- Домен (опционально, для SSL)

## 🎯 Быстрый старт

### Шаг 1: Загрузка файлов на сервер

**На локальной машине (Windows):**

```powershell
# В директории проекта выполните:
bash upload-to-server.sh
```

Этот скрипт:
- Создаст архив проекта
- Загрузит его на сервер
- Распакует в директории `~/elyse-astro-bot`

### Шаг 2: Подключение к серверу

```bash
ssh elyseastro@212.22.68.64
# Пароль: 7pbYu4sRQhLcSpE8hjPhzUJmFjk1vJRf
```

### Шаг 3: Установка зависимостей

```bash
cd ~/elyse-astro-bot
bash deploy.sh
```

Этот скрипт установит:
- Node.js 18.x
- npm
- PM2 (менеджер процессов)
- Nginx
- Git
- Python3 и pip

### Шаг 4: Настройка проекта

```bash
bash setup-project.sh
```

Этот скрипт:
- Установит Python и Node.js зависимости
- Создаст шаблоны `.env` файлов

### Шаг 5: Настройка переменных окружения

**Отредактируйте `.env` файл (для Telegram бота):**
```bash
nano .env
```

```env
# Telegram Bot
BOT_TOKEN="YOUR_BOT_TOKEN_HERE"
ADMIN_ID="YOUR_TELEGRAM_ID"

# Database
DATABASE_URL="sqlite:///bot.db"

# OpenAI (optional)
OPENAI_API_KEY="your-openai-key"
USE_AI="false"

# Mini App URL (замените на ваш домен)
MINIAPP_URL="https://your-domain.com"
```

**Отредактируйте `webapp/.env.local` файл (для веб-приложения):**
```bash
nano webapp/.env.local
```

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"

# Telegram Bot
BOT_TOKEN="YOUR_BOT_TOKEN_HERE"
TELEGRAM_BOT_USERNAME="your_bot_username"
```

### Шаг 6: Сборка и запуск

```bash
bash build-and-run.sh
```

Этот скрипт:
- Соберет Next.js приложение
- Запустит веб-приложение через PM2
- Запустит Telegram бота через PM2
- Настроит автозапуск

### Шаг 7: Настройка Nginx (опционально)

```bash
bash nginx-config.sh your-domain.com
```

## 📊 Управление процессами

### Основные команды PM2:

```bash
# Показать статус всех процессов
pm2 status

# Показать логи
pm2 logs elyse-webapp    # Логи веб-приложения
pm2 logs elyse-bot       # Логи Telegram бота

# Перезапуск
pm2 restart elyse-webapp
pm2 restart elyse-bot
pm2 restart all          # Все процессы

# Остановка
pm2 stop elyse-webapp
pm2 stop elyse-bot
pm2 stop all

# Удаление процесса
pm2 delete elyse-webapp
pm2 delete elyse-bot
```

### Мониторинг:

```bash
# Веб-интерфейс мониторинга
pm2 monit

# Показать использование ресурсов
pm2 show elyse-webapp
pm2 show elyse-bot
```

## 🔒 SSL сертификат (рекомендуется)

### Установка Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

### Получение SSL сертификата:
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Активация полной конфигурации Nginx:
```bash
sudo ln -sf /etc/nginx/sites-available/elyse-astro /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 🔧 Обновление проекта

Для обновления проекта:

1. **Загрузите новые файлы:**
   ```bash
   # На локальной машине
   bash upload-to-server.sh
   ```

2. **На сервере пересоберите проект:**
   ```bash
   cd ~/elyse-astro-bot
   bash build-and-run.sh
   ```

## 🐛 Устранение неполадок

### Проверка логов:
```bash
# Логи приложения
pm2 logs elyse-webapp --lines 100
pm2 logs elyse-bot --lines 100

# Логи Nginx
sudo tail -f /var/log/nginx/elyse-astro.error.log
sudo tail -f /var/log/nginx/elyse-astro.access.log

# Системные логи
journalctl -u nginx -f
```

### Проверка портов:
```bash
# Проверить, что порт 3000 используется
netstat -tulpn | grep :3000

# Проверить статус Nginx
sudo systemctl status nginx
```

### Перезапуск всех сервисов:
```bash
pm2 restart all
sudo systemctl restart nginx
```

## 📝 Важные файлы и директории

- `~/elyse-astro-bot/` - основная директория проекта
- `~/elyse-astro-bot/.env` - настройки Telegram бота
- `~/elyse-astro-bot/webapp/.env.local` - настройки веб-приложения
- `/etc/nginx/sites-available/elyse-astro` - конфигурация Nginx
- `~/.pm2/logs/` - логи PM2

## 🌐 Доступ к приложению

После успешного развертывания:
- **Локальный доступ:** http://212.22.68.64:3000
- **С доменом:** https://your-domain.com
- **Telegram бот:** работает автоматически

## ⚡ Производительность

Для оптимальной работы рекомендуется:
- Минимум 1GB RAM
- 1 CPU core
- 10GB свободного места на диске
- Стабильное интернет-соединение
