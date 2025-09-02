#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки API endpoints нового экрана Today
 * Запуск: node scripts/test-api.js
 */

const BASE_URL = 'http://localhost:3000';
const TODAY = new Date().toISOString().split('T')[0];

const endpoints = [
  {
    name: 'Stories API',
    url: `/api/content/stories?date=${TODAY}&tz=Europe/Amsterdam`,
    method: 'GET'
  },
  {
    name: 'Forecast API',
    url: `/api/content/forecast?date=${TODAY}&tz=Europe/Amsterdam`,
    method: 'GET'
  },
  {
    name: 'Lunar Calendar API',
    url: `/api/content/lunar/month?date=${TODAY}&tz=Europe/Amsterdam`,
    method: 'GET'
  },
  {
    name: 'Banner API',
    url: `/api/content/banner?type=CHAT_ASTROLOGER&tz=Europe/Amsterdam`,
    method: 'GET'
  }
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🧪 Тестирую ${endpoint.name}...`);
    console.log(`   URL: ${BASE_URL}${endpoint.url}`);
    
    const response = await fetch(`${BASE_URL}${endpoint.url}`, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Статус: ${response.status}`);
      console.log(`   📊 Успех: ${data.success}`);
      console.log(`   📈 Источник: ${data.meta?.source || 'N/A'}`);
      console.log(`   📅 Дата: ${data.meta?.date || 'N/A'}`);
      
      if (data.data) {
        if (Array.isArray(data.data)) {
          console.log(`   📝 Количество элементов: ${data.data.length}`);
        } else {
          console.log(`   📝 ID: ${data.data.id || 'N/A'}`);
          console.log(`   📝 Тип: ${data.data.type || 'N/A'}`);
        }
      }
    } else {
      console.log(`   ❌ Статус: ${response.status}`);
      console.log(`   ❌ Ошибка: ${response.statusText}`);
    }
  } catch (error) {
    console.log(`   💥 Ошибка: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Запуск тестов API для экрана Today');
  console.log(`📅 Дата тестирования: ${TODAY}`);
  console.log(`🌐 Базовый URL: ${BASE_URL}`);
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
  
  console.log('\n✨ Тестирование завершено!');
  console.log('\n📋 Следующие шаги:');
  console.log('1. Убедитесь что все API возвращают успешные ответы');
  console.log('2. Проверьте что fallback данные корректны');
  console.log('3. Откройте http://localhost:3000/today в браузере');
  console.log('4. Протестируйте все интерактивные элементы');
}

// Проверяем что скрипт запущен в Node.js
if (typeof window === 'undefined') {
  runTests().catch(console.error);
} else {
  console.log('Этот скрипт должен запускаться в Node.js, а не в браузере');
}





