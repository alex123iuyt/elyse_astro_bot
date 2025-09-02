import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/database';
import { getBotUsers } from '../../../../lib/bot-users';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Получаем всех пользователей бота
    const botUsers = await getBotUsers();
    
    // Получаем зарегистрированных пользователей из основной таблицы
    const registeredUsers = await db.all(`
      SELECT id, telegram_id, name, email, role, is_premium, 
             subscription_type, last_active, created_at, zodiac_sign
      FROM users 
      WHERE telegram_id IS NOT NULL
      ORDER BY created_at DESC
    `);
    
    // Создаем Map для быстрого поиска зарегистрированных пользователей
    const registeredMap = new Map();
    registeredUsers.forEach(user => {
      registeredMap.set(user.telegram_id, user);
    });
    
    // Разделяем пользователей на зарегистрированных и незарегистрированных
    const categorizedUsers = botUsers.map(botUser => {
      const isRegistered = registeredMap.has(botUser.telegram_id);
      const registeredUser = registeredMap.get(botUser.telegram_id);
      
      return {
        ...botUser,
        is_registered: isRegistered,
        registration_status: isRegistered ? 'registered' : 'unregistered',
        user_id: registeredUser?.id || null,
        email: registeredUser?.email || null,
        role: registeredUser?.role || null,
        subscription_type: registeredUser?.subscription_type || null,
        // Дополнительная информация для незарегистрированных
        days_since_last_active: Math.floor((Date.now() - new Date(botUser.last_active).getTime()) / (1000 * 60 * 60 * 24)),
        activity_status: new Date(botUser.last_active) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'active' : 'inactive'
      };
    });
    
    // Статистика
    const stats = {
      total: categorizedUsers.length,
      registered: categorizedUsers.filter(u => u.is_registered).length,
      unregistered: categorizedUsers.filter(u => !u.is_registered).length,
      active: categorizedUsers.filter(u => u.activity_status === 'active').length,
      inactive: categorizedUsers.filter(u => u.activity_status === 'inactive').length,
      premium: categorizedUsers.filter(u => u.is_premium).length
    };
    
    return NextResponse.json({
      success: true,
      users: categorizedUsers,
      stats,
      registered_users: registeredUsers
    });
    
  } catch (error) {
    console.error('Error fetching bot users:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Ошибка получения пользователей бота' 
    }, { status: 500 });
  }
}
