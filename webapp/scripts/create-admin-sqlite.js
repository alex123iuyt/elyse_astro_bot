const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');

async function createAdminUser() {
  try {
    console.log('🚀 Создаем администратора в SQLite базе...');

    const dbPath = path.join(process.cwd(), 'webapp', 'data', 'elyse.db');
    console.log(`📁 Путь к базе: ${dbPath}`);

    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Проверяем, существует ли таблица users
    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    if (!tableExists) {
      console.log('❌ Таблица users не найдена. Создаем структуру базы...');
      await initializeDatabase(db);
    }

    const email = 'admin@elyse.local';
    const password = 'admin123';
    const name = 'Администратор';

    // Проверяем, существует ли уже пользователь с таким email
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser) {
      console.log(`⚠️ Пользователь с email ${email} уже существует`);
      console.log(`📊 ID: ${existingUser.id}`);
      console.log(`👤 Роль: ${existingUser.role}`);
      
      // Обновляем роль на admin если нужно
      if (existingUser.role !== 'admin') {
        await db.run('UPDATE users SET role = ? WHERE id = ?', ['admin', existingUser.id]);
        console.log('✅ Роль обновлена на admin');
      }
      
      // Обновляем пароль если нужно
      const hashedPassword = await bcrypt.hash(password, 12);
      await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, existingUser.id]);
      console.log('✅ Пароль обновлен');
      
      return;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем пользователя
    const result = await db.run(`
      INSERT INTO users (
        email, password_hash, name, birth_date, birth_city, 
        birth_country, timezone, zodiac_sign, role, is_premium
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      email,
      hashedPassword,
      name,
      '1990-01-01',
      'Москва',
      'RU',
      'Europe/Moscow',
      'Козерог',
      'admin',
      1
    ]);

    console.log('✅ Администратор создан успешно!');
    console.log(`📊 ID: ${result.lastID}`);
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Имя: ${name}`);
    console.log(`🔑 Роль: admin`);
    console.log(`🔐 Пароль: ${password}`);
    console.log('\n💡 Теперь вы можете войти в админку:');
    console.log(`   1. Откройте http://localhost:3000/auth`);
    console.log(`   2. Введите email: ${email}`);
    console.log(`   3. Введите пароль: ${password}`);
    console.log(`   4. После входа перейдите в http://localhost:3000/admin`);

  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error);
    throw error;
  }
}

async function initializeDatabase(db) {
  console.log('🔧 Инициализируем структуру базы данных...');
  
  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      name TEXT NOT NULL,
      birth_date DATE NOT NULL,
      birth_time TIME,
      birth_city TEXT NOT NULL,
      birth_country TEXT DEFAULT 'RU',
      timezone TEXT DEFAULT 'Europe/Moscow',
      zodiac_sign TEXT,
      sun_sign TEXT,
      moon_sign TEXT,
      ascendant_sign TEXT,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'manager', 'admin')),
      is_premium BOOLEAN DEFAULT 0,
      premium_until DATETIME,
      subscription_type TEXT DEFAULT 'free',
      chat_count INTEGER DEFAULT 0,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Chat sessions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Messages table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_from_user BOOLEAN NOT NULL,
      is_ai_generated BOOLEAN DEFAULT 0,
      admin_reply_id INTEGER,
      message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'system', 'admin_reply')),
      status TEXT DEFAULT 'sent' CHECK(status IN ('sent', 'delivered', 'read', 'pending')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (admin_reply_id) REFERENCES users (id)
    )
  `);

  // Admin notifications table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admin_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_id INTEGER NOT NULL,
      message_id INTEGER NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      admin_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE,
      FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE,
      FOREIGN KEY (admin_id) REFERENCES users (id)
    )
  `);

  console.log('✅ Структура базы данных создана');
}

// Запускаем создание администратора
createAdminUser()
  .then(() => {
    console.log('\n✨ Скрипт завершен!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Критическая ошибка:', error);
    process.exit(1);
  });
