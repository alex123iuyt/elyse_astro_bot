import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '../../../../lib/auth';
import { getDatabase } from '../../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Недостаточно прав доступа' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const settings = await db.all('SELECT * FROM ai_settings ORDER BY setting_key');

    // Convert to key-value object
    const settingsObj = settings.reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: settingsObj
    });

  } catch (error: any) {
    console.error('Get AI settings error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения настроек AI' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Недостаточно прав доступа' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Неверные параметры' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await db.run(`
        INSERT OR REPLACE INTO ai_settings (setting_key, setting_value, updated_by, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `, [key, value, user.id]);
    }

    return NextResponse.json({
      success: true,
      message: 'Настройки AI обновлены'
    });

  } catch (error: any) {
    console.error('Update AI settings error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления настроек AI' },
      { status: 500 }
    );
  }
}








