#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки рассылки
 * Запуск: node scripts/test-broadcast.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testBroadcast() {
  console.log('🧪 Тестирование рассылки...\n');

  try {
    // 1. Создаем тестовую рассылку
    console.log('1️⃣ Создание рассылки...');
    const createResponse = await fetch(`${BASE_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Тест рассылки',
        text: 'Это тестовое сообщение для проверки рассылки',
        segment: 'all',
        buttonText: 'Открыть',
        buttonUrl: 'https://example.com',
        parseMode: 'HTML'
      })
    });

    const createData = await createResponse.json();
    console.log('✅ Создание рассылки:', createData);

    if (!createData.success) {
      throw new Error(`Ошибка создания рассылки: ${createData.error}`);
    }

    const { jobId, total } = createData;
    console.log(`📊 Job ID: ${jobId}, Всего получателей: ${total}\n`);

    // 2. Запускаем обработку
    console.log('2️⃣ Запуск обработки...');
    const processResponse = await fetch(`${BASE_URL}/api/admin/notifications/process`, {
      method: 'POST'
    });

    const processData = await processResponse.json();
    console.log('✅ Обработка запущена:', processData);

    // 3. Проверяем статус через SSE
    console.log('3️⃣ Подключение к SSE для отслеживания прогресса...');
    
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`${BASE_URL}/api/admin/notifications/sse/${jobId}`);
      
      eventSource.addEventListener('progress', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📈 Прогресс:', data);
          
          if (data.status === 'done' || data.status === 'failed') {
            console.log(`\n🏁 Рассылка завершена со статусом: ${data.status}`);
            console.log(`📊 Итоговая статистика:`);
            console.log(`   - Отправлено: ${data.sent}/${data.total}`);
            console.log(`   - Ошибок: ${data.failed}`);
            console.log(`   - Статус: ${data.status}`);
            
            eventSource.close();
            resolve(data);
          }
        } catch (error) {
          console.error('❌ Ошибка парсинга SSE данных:', error);
        }
      });

      eventSource.addEventListener('error', (error) => {
        console.error('❌ SSE ошибка:', error);
        eventSource.close();
        reject(error);
      });

      // Таймаут на случай если SSE не работает
      setTimeout(() => {
        console.log('⏰ Таймаут SSE, проверяем статус напрямую...');
        eventSource.close();
        checkJobStatus(jobId).then(resolve).catch(reject);
      }, 10000);
    });

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
    throw error;
  }
}

async function checkJobStatus(jobId) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/notifications/history`);
    const data = await response.json();
    
    const job = data.find(j => j.id === jobId);
    if (job) {
      console.log('📊 Статус job из истории:', job);
      return job;
    } else {
      throw new Error('Job не найден в истории');
    }
  } catch (error) {
    console.error('❌ Ошибка проверки статуса:', error);
    throw error;
  }
}

async function testDatabaseConnection() {
  console.log('🔍 Проверка подключения к базе данных...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/stats`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ База данных доступна');
      console.log('📊 Статистика:', data.data);
    } else {
      throw new Error('Ошибка получения статистики');
    }
  } catch (error) {
    console.error('❌ Ошибка подключения к БД:', error);
    throw error;
  }
}

async function testBotToken() {
  console.log('🤖 Проверка токена бота...');
  
  try {
    // Проверяем через простой запрос к Telegram API
    const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getMe`);
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Токен бота валиден');
      console.log('📱 Информация о боте:', data.result);
    } else {
      throw new Error(`Ошибка Telegram API: ${data.description}`);
    }
  } catch (error) {
    console.error('❌ Ошибка проверки токена бота:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Запуск тестов рассылки\n');
  
  try {
    // Проверяем базовые компоненты
    await testDatabaseConnection();
    console.log('');
    
    await testBotToken();
    console.log('');
    
    // Запускаем тест рассылки
    await testBroadcast();
    
    console.log('\n🎉 Все тесты завершены успешно!');
    
  } catch (error) {
    console.error('\n💥 Тесты завершились с ошибкой:', error.message);
    process.exit(1);
  }
}

// Запуск если скрипт вызван напрямую
if (require.main === module) {
  main();
}

module.exports = { testBroadcast, testDatabaseConnection, testBotToken };






