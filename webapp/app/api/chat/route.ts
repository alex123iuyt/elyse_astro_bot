import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '../../../lib/auth';
import { getDatabase, createChatSession, createMessage, getUserChatHistory } from '../../../lib/database';

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
    
    if (!user) {
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 401 }
      );
    }

    // Get chat history for user
    const messages = await getUserChatHistory(user.id);

    return NextResponse.json({
      success: true,
      data: messages
    });

  } catch (error: any) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения истории чата' },
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
    
    if (!user) {
      return NextResponse.json(
        { error: 'Неверный токен' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Сообщение не может быть пустым' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // TODO: лимиты для free тарифов можно хранить в БД/настройках

    // Find or create active session
    let session = await db.get(`
      SELECT id FROM chat_sessions 
      WHERE user_id = ? AND is_active = 1
      ORDER BY created_at DESC LIMIT 1
    `, [user.id]);

    if (!session) {
      // Create new session
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionId = await createChatSession(user.id, sessionToken);
      session = { id: sessionId };
    }

    // Save user message
    await createMessage(session.id, user.id, message, true);

    // Update user's last activity
    await db.run(`
      UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?
    `, [user.id]);

    // Generate AI response
    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        kind: 'chat',
        user_context: {
          message: message,
          zodiac: user.zodiac_sign,
          name: user.name
        },
        isChat: true
      })
    });

    const aiData = await aiResponse.json();
    const aiText = aiData.text || 'Извините, не могу сейчас ответить. Попробуйте позже.';

    // Save AI response
    await createMessage(session.id, user.id, aiText, false, true);

    return NextResponse.json({
      success: true,
      data: {
        userMessage: message,
        aiResponse: aiText
      }
    });

  } catch (error: any) {
    console.error('Chat message error:', error);
    return NextResponse.json(
      { error: 'Ошибка отправки сообщения' },
      { status: 500 }
    );
  }
}

