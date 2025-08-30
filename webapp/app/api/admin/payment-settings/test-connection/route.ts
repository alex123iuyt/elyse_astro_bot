import { NextRequest, NextResponse } from 'next/server';

// POST - тестирование соединения с Т-Банком
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { enabled, merchantId, secretKey, testMode } = body;

    // Валидация
    if (!enabled) {
      return NextResponse.json(
        { error: 'Эквайринг отключен' },
        { status: 400 }
      );
    }

    if (!merchantId || !secretKey) {
      return NextResponse.json(
        { error: 'Не заполнены обязательные поля (Merchant ID, Secret Key)' },
        { status: 400 }
      );
    }

    // Имитируем тест соединения с Т-Банком
    // В реальном приложении здесь будет API вызов к Т-Банку
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Проверяем, что данные выглядят корректно
    if (merchantId.length < 5 || secretKey.length < 10) {
      return NextResponse.json(
        { error: 'Неверный формат данных для подключения' },
        { status: 400 }
      );
    }

    const mode = testMode ? 'тестовой' : 'боевой';
    
    return NextResponse.json({ 
      message: `Соединение с Т-Банком в ${mode} режиме успешно установлено!`,
      testMode,
      merchantId: merchantId.substring(0, 8) + '...'
    });
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json(
      { error: 'Ошибка тестирования соединения' },
      { status: 500 }
    );
  }
}

