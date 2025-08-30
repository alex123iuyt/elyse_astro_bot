import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = (searchParams.get('search') || '').trim();
    const role = (searchParams.get('role') || '').trim();
    const premium = (searchParams.get('premium') || '').trim(); // '1'|'0'
    const activeSince = (searchParams.get('active_since') || '').trim(); // ISO date
    const sort = (searchParams.get('sort') || 'last_active').trim();
    const order = ((searchParams.get('order') || 'DESC').toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    let whereClauses: string[] = [];
    let params: any[] = [];
    if (search) {
      whereClauses.push(`(name LIKE ? OR email LIKE ? OR zodiac_sign LIKE ? OR telegram_id LIKE ?)`);
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    if (role) {
      whereClauses.push(`role = ?`);
      params.push(role);
    }
    if (premium === '1' || premium === '0') {
      whereClauses.push(`is_premium = ?`);
      params.push(premium === '1' ? 1 : 0);
    }
    if (activeSince) {
      whereClauses.push(`datetime(last_active) >= datetime(?)`);
      params.push(activeSince);
    }
    const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const users = await db.all(
      `SELECT id, name, email, role, zodiac_sign, is_premium, last_active, created_at,
              (SELECT COUNT(*) FROM messages WHERE user_id = users.id AND is_from_user = 1) as message_count
       FROM users ${where}
       ORDER BY ${['name','email','role','zodiac_sign','is_premium','last_active','created_at','message_count'].includes(sort) ? sort : 'last_active'} ${order}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const totalRow = await db.get(`SELECT COUNT(*) as c FROM users ${where}`, params);
    const totalPages = Math.max(1, Math.ceil((totalRow?.c || 0) / limit));

    return NextResponse.json({ success: true, data: { users, totalPages } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ошибка получения пользователей' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, data } = body as { action: string; userId?: number; data?: any };
    const db = await getDatabase();

    if (action === 'updateRole' && userId && data?.role) {
      await db.run(`UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [data.role, userId]);
      return NextResponse.json({ success: true });
    }

    if (action === 'deleteUser' && userId) {
      await db.run(`DELETE FROM users WHERE id = ?`, [userId]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Неверное действие' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ошибка выполнения действия' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body as { userId: number; updates: Record<string, any> };
    if (!userId || !updates) return NextResponse.json({ success: false, error: 'userId/updates required' }, { status: 400 });

    const allowed = ['role', 'is_premium', 'subscription_type', 'premium_until', 'name', 'email'];
    const keys = Object.keys(updates).filter(k => allowed.includes(k));
    if (keys.length === 0) return NextResponse.json({ success: false, error: 'Нет валидных полей' }, { status: 400 });

    const sets = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => updates[k]);
    const db = await getDatabase();
    await db.run(`UPDATE users SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, userId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ошибка обновления пользователя' }, { status: 500 });
  }
}
