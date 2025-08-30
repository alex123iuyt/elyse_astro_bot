#!/usr/bin/env node

/**
 * Быстрый тест рассылки
 * Запуск: node scripts/quick-test.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function quickTest() {
  console.log('🚀 Быстрый тест рассылки\n');

  try {
    // 1. Проверяем доступность API
    console.log('1️⃣ Проверка доступности API...');
    const healthCheck = await fetch(`${BASE_URL}/api/admin/stats`);
    if (healthCheck.ok) {
      console.log('   ✅ API доступен');
    } else {
      throw new Error(`API недоступен: ${healthCheck.status}`);
    }

    // 2. Создаем простую рассылку
    console.log('\n2️⃣ Создание тестовой рассылки...');
    const createResponse = await fetch(`${BASE_URL}/api/admin/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Быстрый тест',
        text: 'Тестовое сообщение для быстрой проверки',
        segment: 'all'
      })
    });

    const createData = await createResponse.json();
    console.log('   📊 Ответ API:', createData);

    if (!createData.success) {
      throw new Error(`Ошибка создания: ${createData.error}`);
    }

    const { jobId, total } = createData;
    console.log(`   ✅ Рассылка создана: Job ID ${jobId}, получателей: ${total}`);

    // 3. Запускаем обработку
    console.log('\n3️⃣ Запуск обработки...');
    const processResponse = await fetch(`${BASE_URL}/api/admin/notifications/process`, {
      method: 'POST'
    });

    const processData = await processResponse.json();
    console.log('   📊 Результат обработки:', processData);

    // 4. Проверяем статус
    console.log('\n4️⃣ Проверка статуса...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Ждем 2 секунды

    const processResponse2 = await fetch(`${BASE_URL}/api/admin/notifications/process`, {
      method: 'POST'
    });

    const processData2 = await processResponse2.json();
    console.log('   📊 Статус после обработки:', processData2);

    // 5. Проверяем историю
    console.log('\n5️⃣ Проверка истории...');
    const historyResponse = await fetch(`${BASE_URL}/api/admin/notifications/history`);
    const historyData = await historyResponse.json();

    console.log('   📊 История рассылок:', historyData);

    // Проверяем структуру данных
    if (!Array.isArray(historyData)) {
      console.log('   ⚠️  История не является массивом, проверяем структуру...');
      if (historyData && typeof historyData === 'object' && historyData.data) {
        const currentJob = historyData.data.find(job => job.id === jobId);
        if (currentJob) {
          console.log('   📊 Job в истории:', {
            id: currentJob.id,
            title: currentJob.title,
            status: currentJob.status,
            sent: currentJob.sent,
            failed: currentJob.failed,
            total: currentJob.total
          });
        } else {
          console.log('   ❌ Job не найден в истории');
        }
      } else {
        console.log('   ❌ Неожиданная структура истории:', historyData);
      }
    } else {
      const currentJob = historyData.find(job => job.id === jobId);
      if (currentJob) {
        console.log('   📊 Job в истории:', {
          id: currentJob.id,
          title: currentJob.title,
          status: currentJob.status,
          sent: currentJob.sent,
          failed: currentJob.failed,
          total: currentJob.total
        });
      } else {
        console.log('   ❌ Job не найден в истории');
      }
    }

    console.log('\n✅ Быстрый тест завершен!');
    
    // Проверяем ошибки
    if (processData2.stats && processData2.stats.failed_count > 0) {
      console.log(`⚠️  Внимание: ${processData2.stats.failed_count} ошибок при отправке`);
      console.log('   Проверьте логи для деталей');
    }

  } catch (error) {
    console.error('\n❌ Ошибка теста:', error.message);
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  quickTest();
}

module.exports = { quickTest };
