#!/usr/bin/env node

/**
 * Скрипт для миграции базы данных рассылок
 * Добавляет новые статусы: cancelled, paused
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function migrateDatabase() {
  console.log('🔄 Начинаем миграцию базы данных...\n');

  try {
    const dbPath = path.join(process.cwd(), 'data', 'elyse.db');
    console.log(`📁 Путь к базе данных: ${dbPath}`);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('✅ База данных открыта');

    // Проверяем текущую схему таблицы broadcast_jobs
    console.log('\n1️⃣ Проверяем текущую схему таблицы broadcast_jobs...');
    
    try {
      const tableInfo = await db.all(`PRAGMA table_info(broadcast_jobs)`);
      console.log('   ✅ Таблица broadcast_jobs существует');
      
      const statusColumn = tableInfo.find(col => col.name === 'status');
      if (statusColumn) {
        console.log(`   📋 Колонка status: ${statusColumn.type}, default: ${statusColumn.dflt_value}`);
      }
    } catch (e) {
      console.log('   ❌ Таблица broadcast_jobs не существует');
      return;
    }

    // Проверяем текущие статусы
    console.log('\n2️⃣ Проверяем текущие статусы рассылок...');
    
    try {
      const statuses = await db.all(`
        SELECT status, COUNT(*) as count 
        FROM broadcast_jobs 
        GROUP BY status
      `);
      
      if (statuses.length > 0) {
        console.log('   📊 Текущие статусы:');
        statuses.forEach(s => {
          console.log(`      - ${s.status}: ${s.count} рассылок`);
        });
      } else {
        console.log('   ℹ️ Нет рассылок в базе');
      }
    } catch (e) {
      console.log('   ❌ Ошибка при проверке статусов:', e.message);
    }

    // Проверяем, поддерживает ли база новые статусы
    console.log('\n3️⃣ Проверяем поддержку новых статусов...');
    
    try {
      // Пробуем обновить статус на 'cancelled'
      const testUpdate = await db.run(`
        UPDATE broadcast_jobs 
        SET status = 'cancelled' 
        WHERE id = (SELECT id FROM broadcast_jobs LIMIT 1)
      `);
      
      if (testUpdate.changes > 0) {
        console.log('   ✅ Новые статусы поддерживаются');
        
        // Возвращаем обратно
        await db.run(`
          UPDATE broadcast_jobs 
          SET status = 'queued' 
          WHERE status = 'cancelled'
        `);
      }
    } catch (e) {
      console.log('   ❌ База не поддерживает новые статусы:', e.message);
      console.log('   🔧 Требуется пересоздание таблицы');
      
      // Создаем резервную копию
      console.log('\n4️⃣ Создаем резервную копию...');
      
      try {
        await db.run(`CREATE TABLE IF NOT EXISTS broadcast_jobs_backup AS SELECT * FROM broadcast_jobs`);
        console.log('   ✅ Резервная копия создана');
        
        // Удаляем старую таблицу
        await db.run(`DROP TABLE broadcast_jobs`);
        console.log('   ✅ Старая таблица удалена');
        
        // Создаем новую с обновленной схемой
        await db.run(`
          CREATE TABLE broadcast_jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            text TEXT NOT NULL,
            filter TEXT,
            total INTEGER DEFAULT 0,
            sent INTEGER DEFAULT 0,
            failed INTEGER DEFAULT 0,
            status TEXT DEFAULT 'queued' CHECK(status IN ('queued','running','done','failed','cancelled','paused')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            started_at DATETIME,
            finished_at DATETIME
          )
        `);
        console.log('   ✅ Новая таблица создана');
        
        // Восстанавливаем данные
        await db.run(`
          INSERT INTO broadcast_jobs 
          SELECT id, title, text, filter, total, sent, failed, status, created_at, started_at, finished_at 
          FROM broadcast_jobs_backup
        `);
        console.log('   ✅ Данные восстановлены');
        
        // Удаляем резервную копию
        await db.run(`DROP TABLE broadcast_jobs_backup`);
        console.log('   ✅ Резервная копия удалена');
        
      } catch (backupError) {
        console.log('   ❌ Ошибка при пересоздании таблицы:', backupError.message);
        return;
      }
    }

    // Проверяем финальное состояние
    console.log('\n5️⃣ Проверяем финальное состояние...');
    
    try {
      const finalStatuses = await db.all(`
        SELECT status, COUNT(*) as count 
        FROM broadcast_jobs 
        GROUP BY status
      `);
      
      if (finalStatuses.length > 0) {
        console.log('   📊 Финальные статусы:');
        finalStatuses.forEach(s => {
          console.log(`      - ${s.status}: ${s.count} рассылок`);
        });
      }
      
      // Проверяем схему
      const finalTableInfo = await db.all(`PRAGMA table_info(broadcast_jobs)`);
      const finalStatusColumn = finalTableInfo.find(col => col.name === 'status');
      if (finalStatusColumn) {
        console.log(`   📋 Колонка status: ${finalStatusColumn.type}, default: ${finalStatusColumn.dflt_value}`);
      }
      
    } catch (e) {
      console.log('   ❌ Ошибка при финальной проверке:', e.message);
    }

    console.log('\n✅ Миграция завершена успешно!');
    console.log('\n📝 Новые возможности:');
    console.log('   - 🚫 Отмена рассылок (статус: cancelled)');
    console.log('   - ⏸️ Приостановка рассылок (статус: paused)');
    console.log('   - 🔄 Возобновление приостановленных рассылок');
    console.log('   - 🗑️ Удаление старых рассылок');
    console.log('   - 👁️ Просмотр деталей рассылок');

  } catch (error) {
    console.error('❌ Критическая ошибка миграции:', error);
    process.exit(1);
  }
}

// Запускаем миграцию
migrateDatabase().catch(console.error);









