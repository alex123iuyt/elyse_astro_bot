import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/database';

export async function GET() {
  try {
    const db = await getDatabase();
    const usersTotal = await db.get(`SELECT COUNT(*) as c FROM users`);
    const dau = await db.get(`SELECT COUNT(*) as c FROM users WHERE DATE(last_active) = DATE('now','localtime')`);
    const mau = await db.get(`SELECT COUNT(*) as c FROM users WHERE last_active >= datetime('now','-30 days','localtime')`);
    const messages = await db.get(`SELECT COUNT(*) as c FROM messages`);
    const chats = await db.get(`SELECT COUNT(*) as c FROM chat_sessions`);
    const premium = await db.get(`SELECT COUNT(*) as c FROM users WHERE is_premium = 1`);

    const analytics = {
      userAnalytics: {
        total: usersTotal.c,
        active: dau.c,
        newThisWeek: 0,
        newThisMonth: 0,
        byRole: {}
      },
      chatAnalytics: {
        total: chats.c,
        active: chats.c,
        resolved: 0,
        avgResponseTime: '-',
        totalMessages: messages.c,
        messagesPerChat: chats.c ? (messages.c / chats.c).toFixed(1) : 0
      },
      premiumAnalytics: {
        total: premium.c,
        revenue: 0,
        conversionRate: usersTotal.c ? ((premium.c / usersTotal.c) * 100).toFixed(1) : 0,
        avgSubscriptionValue: 0
      },
      activityChart: [] as any[]
    };

    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ошибка получения аналитики' }, { status: 500 });
  }
}

