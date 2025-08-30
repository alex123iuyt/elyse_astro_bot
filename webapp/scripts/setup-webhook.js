#!/usr/bin/env node

/**
 * Скрипт для настройки Telegram webhook
 * Запуск: node scripts/setup-webhook.js
 */

// Загружаем переменные окружения напрямую из файла
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (error) {
  console.warn('⚠️  Не удалось загрузить .env файл');
}

console.log('🔧 Настройка Telegram webhook...\n');

async function setupWebhook() {
  try {
    const botToken = process.env.BOT_TOKEN;
    const baseUrl = process.env.BASE_URL;

    if (!botToken) {
      console.error('❌ BOT_TOKEN не установлен в .env файле');
      process.exit(1);
    }

    if (!baseUrl) {
      console.error('❌ BASE_URL не установлен в .env файле');
      console.log('   💡 Добавьте BASE_URL=https://your-ngrok-url.ngrok.io в .env');
      process.exit(1);
    }

    const webhookUrl = `${baseUrl}/api/webhook/telegram`;
    console.log(`🌐 Webhook URL: ${webhookUrl}`);

    // Сначала получаем информацию о боте
    console.log('🤖 Проверка бота...');
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const botInfo = await botInfoResponse.json();
    
    if (!botInfo.ok) {
      console.error('❌ Ошибка получения информации о боте:', botInfo.description);
      process.exit(1);
    }

    console.log(`✅ Бот найден: @${botInfo.result.username} (${botInfo.result.first_name})`);

    // Удаляем старый webhook
    console.log('🗑️  Удаление старого webhook...');
    const deleteResponse = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`);
    const deleteResult = await deleteResponse.json();
    console.log('   ', deleteResult.ok ? '✅ Удален' : '⚠️  Не найден');

    // Устанавливаем новый webhook
    console.log('📡 Установка нового webhook...');
    const setWebhookResponse = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        drop_pending_updates: true,
        allowed_updates: ['message', 'callback_query']
      }),
    });

    const setWebhookResult = await setWebhookResponse.json();
    
    if (!setWebhookResult.ok) {
      console.error('❌ Ошибка установки webhook:', setWebhookResult.description);
      process.exit(1);
    }

    console.log('✅ Webhook успешно установлен!');

    // Проверяем статус webhook
    console.log('\n🔍 Проверка статуса webhook...');
    const webhookInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const webhookInfo = await webhookInfoResponse.json();
    
    if (webhookInfo.ok) {
      const info = webhookInfo.result;
      console.log('📊 Информация о webhook:');
      console.log(`   URL: ${info.url}`);
      console.log(`   Ожидающих обновлений: ${info.pending_update_count}`);
      console.log(`   Последняя ошибка: ${info.last_error_message || 'Нет'}`);
      console.log(`   Максимальные соединения: ${info.max_connections}`);
    }

    console.log('\n🎉 Настройка завершена!');
    console.log('\n💡 Теперь:');
    console.log('   1. Напишите боту /start в Telegram');
    console.log('   2. Проверьте админку → Пользователи бота');
    console.log('   3. Создайте тестовую рассылку');

  } catch (error) {
    console.error('❌ Ошибка настройки webhook:', error.message);
    process.exit(1);
  }
}

// Запускаем настройку
setupWebhook();
