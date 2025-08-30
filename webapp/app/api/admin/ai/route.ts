import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/database';

export async function GET() {
  try {
    const db = await getDatabase();
    const rows = await db.all(`SELECT setting_key, setting_value FROM ai_settings`);
    const data: Record<string, string> = {};
    rows.forEach((r: any) => { data[r.setting_key] = r.setting_value; });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ошибка получения AI настроек' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    for (const [key, value] of Object.entries(body)) {
      await db.run(`INSERT INTO ai_settings (setting_key, setting_value) VALUES (?, ?) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP`, [
        key, String(value)
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ошибка выполнения действия' }, { status: 500 });
  }
}

