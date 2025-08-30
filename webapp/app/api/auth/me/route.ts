import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../lib/auth';
import { getUserById } from '../../../../lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Получаем токен из cookie
    const token = request.cookies.get('elyse_token')?.value;
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Токен не найден' 
      }, { status: 401 });
    }

    // Проверяем токен
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        error: 'Недействительный токен' 
      }, { status: 401 });
    }

    // Получаем данные пользователя из базы
    const user = await getUserById(decoded.id);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Пользователь не найден' 
      }, { status: 404 });
    }

    // Возвращаем данные пользователя (без пароля)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(), // Преобразуем ID в строку
        email: user.email,
        name: user.name,
        role: user.role,
        zodiac_sign: user.zodiac_sign,
        is_premium: user.is_premium,
        birth_date: user.birth_date,
        birth_city: user.birth_city
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Ошибка проверки авторизации' 
    }, { status: 500 });
  }
}

