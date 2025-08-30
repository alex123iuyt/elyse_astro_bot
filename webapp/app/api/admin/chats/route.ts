import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');

    if (userIdParam) {
      const userId = parseInt(userIdParam, 10);
      const messages = await db.all(`
        SELECT m.id, m.content, m.is_from_user, m.message_type, m.created_at
        FROM messages m
        JOIN chat_sessions cs ON cs.id = m.session_id
        WHERE cs.user_id = ?
        ORDER BY m.created_at ASC
      `, [userId]);
      return NextResponse.json({ success: true, data: { messages } });
    }

    const rows = await db.all(`
      SELECT 
        u.id, u.name, u.email, u.zodiac_sign, u.is_premium, u.last_active,
        (
          SELECT COUNT(*) FROM messages m 
          JOIN chat_sessions cs ON cs.id = m.session_id 
          WHERE cs.user_id = u.id
        ) as message_count,
        (
          SELECT m2.content FROM messages m2 
          JOIN chat_sessions cs2 ON cs2.id = m2.session_id 
          WHERE cs2.user_id = u.id ORDER BY m2.created_at DESC LIMIT 1
        ) as last_message,
        (
          SELECT m3.created_at FROM messages m3 
          JOIN chat_sessions cs3 ON cs3.id = m3.session_id 
          WHERE cs3.user_id = u.id ORDER BY m3.created_at DESC LIMIT 1
        ) as last_message_time,
        0 as unread_count
      FROM users u
      ORDER BY last_active DESC
      LIMIT 1000
    `);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ошибка получения чатов' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message } = body as { userId: number; message: string };
    const db = await getDatabase();

    // find active session or create one
    let session = await db.get(`SELECT id FROM chat_sessions WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1`, [userId]);
    if (!session) {
      const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const res = await db.run(`INSERT INTO chat_sessions (user_id, session_token) VALUES (?, ?)`, [userId, sessionToken]);
      session = { id: res.lastID } as any;
    }

    await db.run(`
      INSERT INTO messages (session_id, user_id, content, is_from_user, message_type)
      VALUES (?, ?, ?, 0, 'admin_reply')
    `, [session.id, userId, message]);
    await db.run(`UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?`, [userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ошибка выполнения действия' }, { status: 500 });
  }
}
