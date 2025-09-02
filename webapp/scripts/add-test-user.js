#!/usr/bin/env node

/**
 * Скрипт для добавления тестового пользователя бота
 * Запуск: node scripts/add-test-user.js
 */

import { promises as fs } from 'fs';
import path from 'path';

const BOT_USERS_FILE = path.join(process.cwd(), 'data', 'bot-users.json');

async function addTestUser() {
  console.log('🔧 Добавление тестового пользователя...\n');

  try {
    // Читаем существующих пользователей
    let users = [];
    try {
      const data = await fs.readFile(BOT_USERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      users = parsed.users || [];
    } catch (error) {
      console.log('📝 Создаем новый файл пользователей');
    }

    // Создаем тестового пользователя
    const testUser = {
      id: `tg_${Date.now()}`,
      telegram_id: '123456789', // Замените на ваш реальный Telegram ID
      name: 'Тестовый Пользователь',
      username: 'test_user',
      birth_date: '1990-01-01',
      birth_city: 'Москва',
      timezone: 'Europe/Moscow',
      zodiac_sign: 'Козерог',
      is_premium: false,
      last_active: new Date().toISOString(),
      created_at: new Date().toISOString(),
      message_count: 0
    };

    // Проверяем, не существует ли уже пользователь с таким telegram_id
    const existingUser = users.find(u => u.telegram_id === testUser.telegram_id);
    if (existingUser) {
      console.log('⚠️  Пользователь с таким Telegram ID уже существует:');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Имя: ${existingUser.name}`);
      console.log(`   Username: ${existingUser.username || '—'}`);
      console.log(`   Последняя активность: ${new Date(existingUser.last_active).toLocaleString('ru-RU')}`);
      
      // Обновляем активность
      existingUser.last_active = new Date().toISOString();
      console.log('   ✅ Активность обновлена');
    } else {
      // Добавляем нового пользователя
      users.push(testUser);
      console.log('✅ Добавлен новый тестовый пользователь:');
      console.log(`   ID: ${testUser.id}`);
      console.log(`   Telegram ID: ${testUser.telegram_id}`);
      console.log(`   Имя: ${testUser.name}`);
      console.log(`   Username: ${testUser.username}`);
      console.log(`   Знак зодиака: ${testUser.zodiac_sign}`);
    }

    // Сохраняем в файл
    await fs.writeFile(BOT_USERS_FILE, JSON.stringify({ users }, null, 2));
    console.log('\n💾 Файл сохранен');

    // Показываем статистику
    console.log('\n📊 Статистика пользователей:');
    console.log(`   Всего: ${users.length}`);
    console.log(`   Активных за неделю: ${users.filter(u => {
      const lastActive = new Date(u.last_active);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastActive > weekAgo;
    }).length}`);

    console.log('\n💡 Для тестирования рассылки:');
    console.log('   1. Замените telegram_id в скрипте на ваш реальный ID');
    console.log('   2. Напишите боту /start');
    console.log('   3. Создайте рассылку через админку');

  } catch (error) {
    console.error('❌ Ошибка добавления пользователя:', error.message);
  }
}

// Запускаем добавление
addTestUser().then(() => {
  console.log('\n✅ Операция завершена');
}).catch(error => {
  console.error('💥 Критическая ошибка:', error);
  process.exit(1);
});









