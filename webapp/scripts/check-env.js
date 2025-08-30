#!/usr/bin/env node

/**
 * Скрипт для проверки переменных окружения
 * Запуск: node scripts/check-env.js
 */

console.log('🔍 Проверка переменных окружения...\n');

// Проверяем основные переменные
const requiredVars = [
  'BOT_TOKEN',
  'NODE_ENV',
  'BASE_URL'
];

const optionalVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ADMIN_EMAIL'
];

console.log('📋 Обязательные переменные:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Скрываем токен бота для безопасности
    if (varName === 'BOT_TOKEN') {
      const masked = value.length > 8 ? 
        value.substring(0, 4) + '...' + value.substring(value.length - 4) : 
        '***';
      console.log(`   ✅ ${varName}: ${masked}`);
    } else {
      console.log(`   ✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`   ❌ ${varName}: НЕ УСТАНОВЛЕНА`);
  }
});

console.log('\n📋 Опциональные переменные:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✅ ${varName}: ${value}`);
  } else {
    console.log(`   ⚠️  ${varName}: не установлена (не критично)`);
  }
});

// Проверяем BOT_TOKEN более детально
console.log('\n🤖 Проверка BOT_TOKEN:');
const botToken = process.env.BOT_TOKEN;
if (botToken) {
  // Проверяем формат токена
  if (botToken.match(/^\d+:[A-Za-z0-9_-]+$/)) {
    console.log('   ✅ Формат токена корректный');
    
    // Извлекаем ID бота
    const botId = botToken.split(':')[0];
    console.log(`   📱 ID бота: ${botId}`);
    
    // Проверяем токен через API
    console.log('   🔍 Проверка токена через Telegram API...');
    fetch(`https://api.telegram.org/bot${botToken}/getMe`)
      .then(response => response.json())
      .then(data => {
        if (data.ok) {
          console.log('   ✅ Токен валиден');
          console.log(`   📱 Имя бота: ${data.result.first_name}`);
          console.log(`   🆔 Username: @${data.result.username}`);
        } else {
          console.log(`   ❌ Токен недействителен: ${data.description}`);
        }
      })
      .catch(error => {
        console.log(`   ❌ Ошибка проверки: ${error.message}`);
      });
  } else {
    console.log('   ❌ Неверный формат токена');
    console.log('   💡 Ожидается формат: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
  }
} else {
  console.log('   ❌ BOT_TOKEN не установлен');
  console.log('   💡 Добавьте в .env файл: BOT_TOKEN=your_token_here');
}

// Проверяем NODE_ENV
console.log('\n🌍 Проверка NODE_ENV:');
const nodeEnv = process.env.NODE_ENV;
if (nodeEnv) {
  console.log(`   ✅ NODE_ENV: ${nodeEnv}`);
  if (nodeEnv === 'production') {
    console.log('   ⚠️  Режим production - убедитесь что все переменные установлены');
  } else if (nodeEnv === 'development') {
    console.log('   ✅ Режим development - подходит для тестирования');
  }
} else {
  console.log('   ⚠️  NODE_ENV не установлен, используется по умолчанию');
}

// Проверяем BASE_URL
console.log('\n🌐 Проверка BASE_URL:');
const baseUrl = process.env.BASE_URL;
if (baseUrl) {
  console.log(`   ✅ BASE_URL: ${baseUrl}`);
  try {
    const url = new URL(baseUrl);
    console.log(`   ✅ Протокол: ${url.protocol}`);
    console.log(`   ✅ Хост: ${url.host}`);
    console.log(`   ✅ Порт: ${url.port || 'по умолчанию'}`);
  } catch (error) {
    console.log(`   ❌ Неверный формат URL: ${error.message}`);
  }
} else {
  console.log('   ⚠️  BASE_URL не установлен, будет использован http://localhost:3000');
}

console.log('\n📝 Рекомендации:');
if (!process.env.BOT_TOKEN) {
  console.log('   🔴 Установите BOT_TOKEN для работы рассылки');
}
if (!process.env.NODE_ENV) {
  console.log('   🟡 Установите NODE_ENV=development для разработки');
}
if (!process.env.BASE_URL) {
  console.log('   🟡 Установите BASE_URL для тестовых скриптов');
}

console.log('\n✅ Проверка завершена');






