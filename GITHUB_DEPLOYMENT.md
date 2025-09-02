# 🚀 Развертывание Elyse Astro Bot с GitHub

## ✅ Репозиторий обновлен!
**GitHub URL:** https://github.com/alex123iuyt/elyse_astro_bot.git

## 📋 Что добавлено в репозиторий:

### 🔐 Система авторизации:
- Блокирующая модалка для неавторизованных пользователей
- Скрытие иконки профиля в хедере для неавторизованных
- Отключение скролла на защищенных страницах
- Компоненты: `AuthContentGate`, `CenteredAuthModal`, `PageWithAuth`

### 🚀 Скрипты развертывания:
- `deploy.sh` - автоматическая установка зависимостей
- `setup-project.sh` - настройка проекта и .env файлов  
- `build-and-run.sh` - сборка и запуск с PM2
- `nginx-config.sh` - настройка веб-сервера
- `DEPLOYMENT.md` - подробная инструкция

### 🐛 Исправления:
- Исправлена ошибка InstagramStories (белый экран)
- Устранены TypeScript ошибки
- Улучшена обработка ошибок

---

## 🎯 Быстрое развертывание на сервере:

### 1️⃣ Подключитесь к серверу:
```bash
ssh elyseastro@212.22.68.64
# Пароль: 7pbYu4sRQhLcSpE8hjPhzUJmFjk1vJRf
```

### 2️⃣ Клонируйте репозиторий:
```bash
cd ~
git clone https://github.com/alex123iuyt/elyse_astro_bot.git elyse-astro-bot
cd elyse-astro-bot
```

### 3️⃣ Запустите автоматическую установку:
```bash
# Установка зависимостей (Node.js, PM2, Nginx, Python)
chmod +x *.sh
bash deploy.sh
```

### 4️⃣ Настройте проект:
```bash
# Установка пакетов и создание .env файлов
bash setup-project.sh
```

### 5️⃣ Отредактируйте настройки:
```bash
# Основные настройки бота
nano .env
```

**Важные настройки в .env:**
```env
BOT_TOKEN="YOUR_BOT_TOKEN_HERE"
ADMIN_ID="YOUR_TELEGRAM_ID"
MINIAPP_URL="http://212.22.68.64:3000"
DATABASE_URL="sqlite:///bot.db"
USE_AI="false"
DEFAULT_TZ="Europe/Moscow"
```

```bash
# Настройки веб-приложения
nano webapp/.env.local
```

**Важные настройки в webapp/.env.local:**
```env
BOT_TOKEN="YOUR_BOT_TOKEN_HERE"
TELEGRAM_BOT_USERNAME="your_bot_username"
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://212.22.68.64:3000"
DATABASE_URL="file:./dev.db"
```

### 6️⃣ Соберите и запустите:
```bash
# Сборка Next.js и запуск через PM2
bash build-and-run.sh
```

### 7️⃣ Настройте Nginx (опционально):
```bash
# Настройка reverse proxy
bash nginx-config.sh 212.22.68.64
```

### 8️⃣ Проверьте статус:
```bash
pm2 status
pm2 logs elyse-webapp
pm2 logs elyse-bot
```

---

## 🔧 Управление после развертывания:

### Основные команды PM2:
```bash
pm2 status                  # Статус процессов
pm2 restart all            # Перезапуск всех процессов
pm2 stop all               # Остановка всех процессов
pm2 logs elyse-webapp      # Логи веб-приложения
pm2 logs elyse-bot         # Логи Telegram бота
pm2 monit                  # Мониторинг ресурсов
```

### Обновление проекта:
```bash
cd ~/elyse-astro-bot
git pull origin master     # Получить обновления
bash build-and-run.sh      # Пересобрать и перезапустить
```

### Проверка логов:
```bash
# Логи приложения
pm2 logs --lines 50

# Логи Nginx
sudo tail -f /var/log/nginx/error.log

# Системные логи
journalctl -u nginx -f
```

---

## 🌐 Доступ к приложению:

После успешного развертывания:
- **Прямой доступ:** http://212.22.68.64:3000
- **Через Nginx:** http://212.22.68.64
- **Telegram бот:** работает автоматически

---

## 🆘 Устранение неполадок:

### Если веб-приложение не запускается:
```bash
cd ~/elyse-astro-bot/webapp
npm install
npm run build
pm2 restart elyse-webapp
```

### Если бот не отвечает:
```bash
cd ~/elyse-astro-bot
pip3 install --user -r requirements.txt
pm2 restart elyse-bot
pm2 logs elyse-bot
```

### Проверка портов:
```bash
netstat -tulpn | grep :3000  # Проверить порт 3000
sudo systemctl status nginx  # Статус Nginx
```

---

## 📝 Примечания:

1. **Безопасность:** Замените все `YOUR_BOT_TOKEN` и секретные ключи на реальные значения
2. **Домен:** Если есть домен, замените IP адрес на домен в настройках
3. **SSL:** Для продакшена рекомендуется настроить SSL сертификат
4. **Мониторинг:** PM2 автоматически перезапустит процессы при сбоях
5. **Логи:** Регулярно проверяйте логи на наличие ошибок

---

## 🎉 Готово!

Ваше приложение теперь развернуто и готово к использованию! 

- ✅ Система авторизации работает
- ✅ Блокирующая модалка для неавторизованных пользователей
- ✅ Автоматический перезапуск процессов
- ✅ Веб-интерфейс и Telegram бот работают синхронно
