#!/usr/bin/env node

/**
 * Скрипт для проверки состояния базы данных рассылки
 * Запуск: node scripts/check-db.js
 */

// Используем динамический импорт для совместимости с ES модулями
async function getDatabase() {
  try {
    const { getDatabase } = await import('../lib/database.js');
    return getDatabase();
  } catch (error) {
    console.error('❌ Ошибка импорта database:', error.message);
    throw error;
  }
}

async function checkDatabase() {
  console.log('🔍 Проверка базы данных рассылки...\n');

  try {
    const db = await getDatabase();
    
    // 1. Проверяем таблицу broadcast_jobs
    console.log('1️⃣ Таблица broadcast_jobs:');
    const jobs = await db.all(`SELECT * FROM broadcast_jobs ORDER BY created_at DESC LIMIT 5`);
    
    if (jobs.length === 0) {
      console.log('   ❌ Нет записей о рассылках');
    } else {
      console.log(`   ✅ Найдено ${jobs.length} записей:`);
      jobs.forEach(job => {
        console.log(`      - ID: ${job.id}, Заголовок: "${job.title}", Статус: ${job.status}`);
        console.log(`        Создано: ${job.created_at}, Отправлено: ${job.sent || 0}, Ошибок: ${job.failed || 0}`);
      });
    }
    console.log('');

    // 2. Проверяем таблицу broadcast_recipients
    console.log('2️⃣ Таблица broadcast_recipients:');
    const recipients = await db.all(`
      SELECT 
        job_id,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM broadcast_recipients 
      GROUP BY job_id 
      ORDER BY job_id DESC 
      LIMIT 5
    `);
    
    if (recipients.length === 0) {
      console.log('   ❌ Нет получателей рассылки');
    } else {
      console.log(`   ✅ Найдено ${recipients.length} job'ов с получателями:`);
      recipients.forEach(rec => {
        console.log(`      - Job ID: ${rec.job_id}, Всего: ${rec.total}, Ожидают: ${rec.pending}, Отправлено: ${rec.sent}, Ошибок: ${rec.failed}`);
      });
    }
    console.log('');

    // 3. Проверяем детали последнего job'а
    if (jobs.length > 0) {
      const lastJob = jobs[0];
      console.log(`3️⃣ Детали последнего job'а (ID: ${lastJob.id}):`);
      
      const jobRecipients = await db.all(`
        SELECT status, COUNT(*) as count, GROUP_CONCAT(error) as errors
        FROM broadcast_recipients 
        WHERE job_id = ? 
        GROUP BY status
      `, [lastJob.id]);
      
      jobRecipients.forEach(rec => {
        console.log(`   - ${rec.status}: ${rec.count}`);
        if (rec.errors && rec.status === 'failed') {
          console.log(`     Ошибки: ${rec.errors}`);
        }
      });
      console.log('');
    }

    // 4. Проверяем структуру таблиц
    console.log('4️⃣ Структура таблиц:');
    
    try {
      const jobsSchema = await db.all(`PRAGMA table_info(broadcast_jobs)`);
      console.log('   ✅ broadcast_jobs:', jobsSchema.map(col => col.name).join(', '));
    } catch (e) {
      console.log('   ❌ broadcast_jobs не существует');
    }
    
    try {
      const recipientsSchema = await db.all(`PRAGMA table_info(broadcast_recipients)`);
      console.log('   ✅ broadcast_recipients:', recipientsSchema.map(col => col.name).join(', '));
    } catch (e) {
      console.log('   ❌ broadcast_recipients не существует');
    }
    
    console.log('');

    // 5. Проверяем последние ошибки
    console.log('5️⃣ Последние ошибки:');
    const errors = await db.all(`
      SELECT job_id, telegram_id, error, created_at
      FROM broadcast_recipients 
      WHERE status = 'failed' 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (errors.length === 0) {
      console.log('   ✅ Нет ошибок');
    } else {
      console.log(`   ❌ Найдено ${errors.length} ошибок:`);
      errors.forEach(err => {
        console.log(`      - Job ID: ${err.job_id}, Telegram ID: ${err.telegram_id}, Ошибка: ${err.error}`);
      });
    }

  } catch (error) {
    console.error('❌ Ошибка проверки базы данных:', error);
  }
}

async function main() {
  try {
    await checkDatabase();
    console.log('\n✅ Проверка завершена');
  } catch (error) {
    console.error('\n💥 Ошибка:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkDatabase };
