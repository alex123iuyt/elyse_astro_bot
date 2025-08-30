import { NextRequest, NextResponse } from 'next/server';
import { Bot } from 'grammy';
import { upsertBotUser, updateBotUserActivity } from '../../../../lib/bot-users';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  if (!BOT_TOKEN) return NextResponse.json({ error: 'no token' }, { status: 500 });
  if (TELEGRAM_WEBHOOK_SECRET && req.headers.get('x-telegram-bot-api-secret-token') !== TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'bad secret' }, { status: 401 });
  }

  const bot = new Bot(BOT_TOKEN);

  // Middleware to handle user upsert
  bot.use(async (ctx, next) => {
    const telegramId = ctx.from?.id;
    const firstName = ctx.from?.first_name || '';
    const lastName = ctx.from?.last_name || '';
    const username = ctx.from?.username || '';

    if (telegramId) {
      await upsertBotUser(telegramId.toString(), {
        name: `${firstName} ${lastName}`.trim() || username || `User ${telegramId}`,
        username: username || undefined
      });
    }
    await next();
  });

  // Simple feedback for bot commands/messages
  bot.command('start', async ctx => {
    await ctx.reply('Бот жив. Откройте Mini App');
  });
  bot.hears(/.*/, async ctx => {
    const telegramId = ctx.from?.id;
    if (telegramId) {
      await updateBotUserActivity(telegramId.toString());
    }
    await ctx.reply('Спасибо за сообщение!');
  });

  const update = await req.json();
  await bot.handleUpdate(update);
  return NextResponse.json({ ok: true });
}



