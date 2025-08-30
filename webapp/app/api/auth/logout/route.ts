import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Создаем ответ с очищенным cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Успешный выход' 
    });

    // Очищаем cookie с токенами
    response.cookies.set('elyse_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Немедленное истечение
      path: '/'
    });
    response.cookies.set('elyse_refresh', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Ошибка при выходе' 
    }, { status: 500 });
  }
}

