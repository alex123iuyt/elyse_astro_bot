#!/usr/bin/env node

/**
 * Скрипт для проверки пользователей бота
 * Запуск: node scripts/check-bot-users.js
 */

import { promises as fs } from 'fs';
import path from 'path';

const BOT_USERS_FILE = path.join(process.cwd(), 'data', 'bot-users.json');

async function checkBotUsers() {
  console.log('🔍 Проверка пользователей бота...\n');

  try {
    // Проверяем существование файла
    try {
      await fs.access(BOT_USERS_FILE);
      console.log('✅ Файл bot-users.json найден');
    } catch (error) {
      console.log('❌ Файл bot-users.json не найден');
      console.log('   Создаем пустой файл...');
      
      const emptyData = { users: [] };
      await fs.writeFile(BOT_USERS_FILE, JSON.stringify(emptyData, null, 2));
      console.log('   ✅ Пустой файл создан');
      return;
    }

    // Читаем данные
    const data = await fs.readFile(BOT_USERS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    const users = parsed.users || [];

    console.log(`📊 Всего пользователей: ${users.length}`);

    if (users.length === 0) {
      console.log('   ❌ Нет пользователей бота');
      console.log('   💡 Пользователи появятся после отправки /start боту');
      return;
    }

    // Показываем последних 10 пользователей
    console.log('\n👥 Последние пользователи:');
    const recentUsers = users.slice(-10).reverse();
    
    recentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ID: ${user.id}`);
      console.log(`      Telegram ID: ${user.telegram_id}`);
      console.log(`      Имя: ${user.name}`);
      console.log(`      Username: ${user.username || '—'}`);
      console.log(`      Знак зодиака: ${user.zodiac_sign || '—'}`);
      console.log(`      Premium: ${user.is_premium ? '✅' : '❌'}`);
      console.log(`      Последняя активность: ${new Date(user.last_active).toLocaleString('ru-RU')}`);
      console.log(`      Сообщений: ${user.message_count}`);
      console.log('');
    });

    // Статистика
    const premiumUsers = users.filter(u => u.is_premium).length;
    const activeUsers = users.filter(u => {
      const lastActive = new Date(u.last_active);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastActive > weekAgo;
    }).length;

    console.log('📈 Статистика:');
    console.log(`   Premium пользователей: ${premiumUsers}`);
    console.log(`   Активных за неделю: ${activeUsers}`);
    console.log(`   Неактивных: ${users.length - activeUsers}`);

    // Проверяем пользователей для рассылки
    console.log('\n📨 Пользователи для рассылки:');
    const allUsers = users.length;
    const premiumForBroadcast = users.filter(u => u.is_premium).length;
    const inactiveForBroadcast = users.filter(u => {
      const lastActive = new Date(u.last_active);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastActive < weekAgo;
    }).length;

    console.log(`   Всего: ${allUsers}`);
    console.log(`   Premium: ${premiumForBroadcast}`);
    console.log(`   Неактивные (7+ дней): ${inactiveForBroadcast}`);

  } catch (error) {
    console.error('❌ Ошибка проверки пользователей бота:', error.message);
  }
}

// Запускаем проверку
checkBotUsers().then(() => {
  console.log('\n✅ Проверка завершена');
}).catch(error => {
  console.error('💥 Критическая ошибка:', error);
  process.exit(1);
});






