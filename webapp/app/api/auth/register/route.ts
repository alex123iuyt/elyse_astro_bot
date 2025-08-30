import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '../../../../lib/auth';
import { getDatabase } from '../../../../lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      birthDate, 
      birthTime, 
      birthCity, 
      birthCountry,
      goals,
      customGoal
    } = body;

    if (!email || !password || !birthDate || !birthCity) {
      return NextResponse.json({ 
        success: false, 
        error: 'Необходимо заполнить email, пароль, дату и город рождения' 
      }, { status: 400 });
    }

    // Регистрируем пользователя
    const userData = await registerUser({
      name: email.split('@')[0], // Используем часть email как имя
      email,
      password,
      birth_date: birthDate,
      birth_time: birthTime,
      birth_city: birthCity,
      birth_country: birthCountry || 'Россия',
      timezone: 'Europe/Moscow'
    });
    
    if (!userData || !userData.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Пользователь с таким email уже существует' 
      }, { status: 400 });
    }

    // Вычисляем знак зодиака (простая логика)
    const birthDateObj = new Date(birthDate);
    const month = birthDateObj.getMonth() + 1;
    const day = birthDateObj.getDate();
    
    let zodiacSign = 'Неизвестно';
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) zodiacSign = 'Овен';
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) zodiacSign = 'Телец';
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) zodiacSign = 'Близнецы';
    else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) zodiacSign = 'Рак';
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiacSign = 'Лев';
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) zodiacSign = 'Дева';
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) zodiacSign = 'Весы';
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) zodiacSign = 'Скорпион';
    else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) zodiacSign = 'Стрелец';
    else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) zodiacSign = 'Козерог';
    else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) zodiacSign = 'Водолей';
    else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) zodiacSign = 'Рыбы';
    
    // Обновляем данные натальной карты
    const db = await getDatabase();
    await db.run(`
      UPDATE users 
      SET birth_date = ?, birth_time = ?, birth_city = ?, birth_country = ?, 
          zodiac_sign = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [birthDate, birthTime || null, birthCity, birthCountry || 'Россия', zodiacSign, userData.user.id]);

    // Сохраняем цели пользователя (можно создать отдельную таблицу)
    if (goals || customGoal) {
      const allGoals = [...(goals ? goals.split(', ') : []), ...(customGoal ? [customGoal] : [])];
      // Здесь можно сохранить цели в отдельную таблицу или поле
      await db.run(`
        UPDATE users 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [userData.user.id]);
    }

    // Создаем пользователя бота в JSON файле
    try {
      const { upsertBotUser } = await import('../../../../lib/bot-users');
      await upsertBotUser(`web_${userData.user.id}`, {
        name: email.split('@')[0], // Используем часть email как имя
        birth_date: birthDate,
        birth_city: birthCity,
        timezone: 'Europe/Moscow', // По умолчанию
        zodiac_sign: zodiacSign,
        is_premium: false,
        message_count: 0
      });
    } catch (error) {
      console.error('Error creating bot user:', error);
      // Не прерываем регистрацию, если не удалось создать пользователя бота
    }

    // Устанавливаем JWT токен в cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: userData.user.id,
        email: userData.user.email,
        role: userData.user.role
      }
    });

    // Устанавливаем httpOnly cookie с токеном
    response.cookies.set('elyse_token', userData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 дней
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Ошибка регистрации' 
    }, { status: 500 });
  }
}


