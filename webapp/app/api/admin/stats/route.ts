import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/database';
import { getBotUsers } from '../../../../lib/bot-users';

export async function GET() {
  try {
    const db = await getDatabase();
    const usersTotal = await db.get(`SELECT COUNT(*) as c FROM users`);
    const premium = await db.get(`SELECT COUNT(*) as c FROM users WHERE is_premium = 1`);
    const chatsToday = await db.get(`SELECT COUNT(*) as c FROM chat_sessions WHERE DATE(created_at) = DATE('now','localtime')`);
    const messagesUnread = await db.get(`SELECT COUNT(*) as c FROM messages WHERE status != 'read'`);

    // Get bot users stats
    const botUsers = await getBotUsers();
    const botUsersWithTelegram = botUsers.filter(u => u.telegram_id).length;
    const botUsersPremium = botUsers.filter(u => u.is_premium).length;

    // Получаем статистику по рассылкам
    const broadcastStats = await db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) as queued,
        SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as running,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused
      FROM broadcast_jobs
    `);

    const stats = {
      totalUsers: usersTotal.c,
      activeChats: chatsToday.c,
      unreadMessages: messagesUnread.c,
      premiumUsers: premium.c,
      totalRevenue: 0,
      monthlyActiveUsers: usersTotal.c, // placeholder metric
      users_with_telegram: botUsersWithTelegram,
      users_total: botUsers.length,
      bot_users_total: botUsers.length,
      bot_users_premium: botUsersPremium,
      // Статистика рассылок
      broadcasts: {
        total: broadcastStats.total || 0,
        queued: broadcastStats.queued || 0,
        running: broadcastStats.running || 0,
        done: broadcastStats.done || 0,
        failed: broadcastStats.failed || 0,
        cancelled: broadcastStats.cancelled || 0,
        paused: broadcastStats.paused || 0
      }
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ошибка получения статистики' }, { status: 500 });
  }
}

