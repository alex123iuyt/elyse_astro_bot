import { NextRequest, NextResponse } from 'next/server';
import { upsertBotUser } from '../../../../lib/bot-users';

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    console.log('[TELEGRAM_WEBHOOK] Received update:', JSON.stringify(update, null, 2));

    // Обрабатываем сообщения
    if (update.message) {
      const message = update.message;
      const user = message.from;
      
      if (user) {
        console.log('[TELEGRAM_WEBHOOK] Processing user:', {
          id: user.id,
          first_name: user.first_name,
          username: user.username
        });

        // Сохраняем/обновляем пользователя
        const botUser = await upsertBotUser(user.id.toString(), {
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || `User ${user.id}`,
          username: user.username,
          telegram_id: user.id.toString(),
          is_premium: user.is_premium || false,
          last_active: new Date().toISOString(),
          message_count: 1
        });

        console.log('[TELEGRAM_WEBHOOK] User saved:', botUser);

        // Отвечаем на команду /start
        if (message.text === '/start') {
          await sendTelegramMessage(user.id, '🌟 Добро пожаловать в Elyse Astro Bot!\n\nТеперь вы можете получать персональные астрологические прогнозы и участвовать в рассылках.');
        }
      }
    }

    // Обрабатываем callback queries (нажатия на кнопки)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const user = callbackQuery.from;
      
      if (user) {
        console.log('[TELEGRAM_WEBHOOK] Processing callback from user:', user.id);
        
        // Обновляем активность пользователя
        await upsertBotUser(user.id.toString(), {
          last_active: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[TELEGRAM_WEBHOOK] Error processing update:', error);
    return NextResponse.json({ ok: true }); // Всегда возвращаем ok: true для Telegram
  }
}

// Функция для отправки сообщения в Telegram
async function sendTelegramMessage(chatId: number, text: string) {
  try {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      console.error('[TELEGRAM_WEBHOOK] BOT_TOKEN not found');
      return;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      }),
    });

    const result = await response.json();
    console.log('[TELEGRAM_WEBHOOK] Message sent:', result);
    
    return result;
  } catch (error) {
    console.error('[TELEGRAM_WEBHOOK] Error sending message:', error);
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'Telegram webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}






