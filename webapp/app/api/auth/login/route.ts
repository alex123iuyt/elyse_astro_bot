import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '../../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body as { email: string; password: string; rememberMe?: boolean };

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email и пароль обязательны' 
      }, { status: 400 });
    }

    // Авторизуем пользователя
    const result = await loginUser(email, password);
    
    if (!result) {
      return NextResponse.json({ 
        success: false, 
        error: 'Неверный email или пароль' 
      }, { status: 401 });
    }

    // Создаем ответ с данными пользователя
    const response = NextResponse.json({
      success: true,
      message: 'Вход выполнен успешно',
      user: {
        id: result.user.id.toString(), // Преобразуем ID в строку
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        zodiac_sign: result.user.zodiac_sign,
        is_premium: result.user.is_premium,
        birth_date: result.user.birth_date,
        birth_city: result.user.birth_city
      }
    });

    // Устанавливаем httpOnly cookie с токеном
    response.cookies.set('elyse_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Ошибка входа' 
    }, { status: 500 });
  }
}

