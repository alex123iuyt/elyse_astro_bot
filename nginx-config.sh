#!/bin/bash

# Скрипт настройки Nginx для Elyse Astro Bot
# Выполнить после запуска приложения: bash nginx-config.sh your-domain.com

set -e

DOMAIN=${1:-"your-domain.com"}

echo "🌐 Настраиваем Nginx для домена: $DOMAIN"

# Создаем конфигурацию Nginx
sudo tee /etc/nginx/sites-available/elyse-astro << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Redirect all HTTP requests to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL certificates (установите после получения Let's Encrypt)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Временно комментируем SSL для первоначальной настройки
    # include /etc/letsencrypt/options-ssl-nginx.conf;
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Логи
    access_log /var/log/nginx/elyse-astro.access.log;
    error_log /var/log/nginx/elyse-astro.error.log;

    # Основное приложение Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Статические файлы Next.js
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Кэширование статических файлов
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API маршруты
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Telegram webhook (если используется)
    location /api/webhook/telegram {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOF

# Создаем временную конфигурацию только для HTTP (для получения SSL)
sudo tee /etc/nginx/sites-available/elyse-astro-temp << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Логи
    access_log /var/log/nginx/elyse-astro.access.log;
    error_log /var/log/nginx/elyse-astro.error.log;

    # Основное приложение Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Активируем временную конфигурацию
sudo ln -sf /etc/nginx/sites-available/elyse-astro-temp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
sudo nginx -t

# Перезапускаем Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx настроен!"
echo ""
echo "📝 Следующие шаги для SSL:"
echo "1. Установите Certbot: sudo apt install certbot python3-certbot-nginx"
echo "2. Получите SSL сертификат: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "3. Переключитесь на полную конфигурацию:"
echo "   sudo ln -sf /etc/nginx/sites-available/elyse-astro /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "🌐 Сайт доступен по адресу: http://$DOMAIN"
