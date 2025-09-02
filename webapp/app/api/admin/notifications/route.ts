import { NextRequest, NextResponse } from 'next/server';
import { getBotUsersForBroadcast } from '../../../../lib/bot-users';
import { logBroadcast, getDatabase } from '../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    // Обрабатываем FormData для поддержки загрузки файлов
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const text = formData.get('text') as string;
    const segment = formData.get('segment') as string;
    const inactiveDays = parseInt(formData.get('inactiveDays') as string || '7');
    const zodiac = formData.get('zodiac') as string;
    const buttonText = formData.get('buttonText') as string;
    const buttonUrl = formData.get('buttonUrl') as string;
    const parseMode = formData.get('parseMode') as 'Markdown'|'HTML'|'MarkdownV2'|'';
    const image = formData.get('image') as File | null;
    const customButtonsStr = formData.get('customButtons') as string;
    
    // Сохраняем изображение если оно есть
    let imageUrl = '';
    if (image) {
      try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `broadcast_${Date.now()}_${image.name}`;
        const filePath = `public/uploads/${fileName}`;
        
        // Используем fs для записи файла
        const fs = await import('fs/promises');
        await fs.writeFile(filePath, buffer);
        
        imageUrl = `/uploads/${fileName}`;
        console.log('[BROADCAST_CREATE] Image saved:', imageUrl);
      } catch (error) {
        console.error('[BROADCAST_CREATE] Failed to save image:', error);
      }
    }
    
    let customButtons: Array<{text: string, url: string}> = [];
    if (customButtonsStr) {
      try {
        customButtons = JSON.parse(customButtonsStr);
      } catch (e) {
        console.warn('[BROADCAST_CREATE] Failed to parse custom buttons:', e);
      }
    }
    
    console.log('[BROADCAST_CREATE] Request body:', { 
      title, text, segment, inactiveDays, zodiac, buttonText, buttonUrl, parseMode, 
      hasImage: !!image, customButtons 
    });
    
    if (!title || !text) {
      console.log('[BROADCAST_CREATE] Validation failed: missing title or text');
      return NextResponse.json({ success: false, error: 'title/text required' }, { status: 400 });
    }

    // Get users from bot-users.json (all Telegram users)
    console.log('[BROADCAST_CREATE] Calling getBotUsersForBroadcast with:', { segment, inactiveDays, zodiac });
    const users = await getBotUsersForBroadcast(segment, inactiveDays, zodiac);
    console.log('[BROADCAST_CREATE] Found users from bot-users.json:', { count: users.length, segment, inactiveDays, zodiac });
    
    // Дополнительная отладка
    if (users.length === 0) {
      console.log('[BROADCAST_CREATE] WARNING: No users found! This might be a problem.');
    } else {
      console.log('[BROADCAST_CREATE] First few users:', users.slice(0, 3).map(u => ({ id: u.id, telegram_id: u.telegram_id, name: u.name })));
    }

    if (users.length === 0) {
      console.log('[BROADCAST_CREATE] No users found for broadcast');
      return NextResponse.json({ success: false, error: 'Нет пользователей для рассылки' }, { status: 400 });
    }

    // Initialize database connection for job creation
    const db = await getDatabase();

    const payload = { 
      segment: segment || 'all', 
      inactiveDays, 
      zodiac, 
      buttonText, 
      buttonUrl, 
      parseMode,
      hasImage: !!image,
      imageUrl: imageUrl || undefined,
      customButtons: customButtons.length > 0 ? customButtons : undefined
    };
    console.log('[BROADCAST_CREATE] Creating job with payload:', payload);
    
    // Create broadcast job in database for tracking
    const jobData = {
      title,
      text,
      filter: JSON.stringify(payload),
      total: users.length,
      status: 'queued',
      image_url: imageUrl || null,
      custom_buttons: customButtons.length > 0 ? JSON.stringify(customButtons) : null,
      has_image: !!image,
      has_buttons: customButtons.length > 0
    };

    const res = await db.run(`
      INSERT INTO broadcast_jobs (title, text, filter, total, status, image_url, custom_buttons, has_image, has_buttons)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      jobData.title,
      jobData.text,
      jobData.filter,
      jobData.total,
      jobData.status,
      jobData.image_url,
      jobData.custom_buttons,
      jobData.has_image ? 1 : 0,
      jobData.has_buttons ? 1 : 0
    ]);
    const jobId = res.lastID as number;
    console.log('[BROADCAST_CREATE] Job created:', { jobId, title, total: users.length });
    
    // Store recipients
    console.log('[BROADCAST_CREATE] Creating recipients...');
    console.log('[BROADCAST_CREATE] Users to process:', users);
    
    for (const user of users) {
      try {
        console.log('[BROADCAST_CREATE] Inserting recipient:', { jobId, telegramId: user.telegram_id, userName: user.name });
        const result = await db.run(`INSERT INTO broadcast_recipients (job_id, telegram_id, user_name) VALUES (?, ?, ?)`, [
          jobId, user.telegram_id, user.name || `User ${user.telegram_id}`
        ]);
        console.log('[BROADCAST_CREATE] Recipient inserted:', result);
      } catch (recipientError) {
        console.error('[BROADCAST_CREATE] Error inserting recipient:', recipientError);
        throw recipientError;
      }
    }
    console.log('[BROADCAST_CREATE] Recipients created successfully');

    // Логируем создание рассылки
    await logBroadcast({
      level: 'INFO',
      message: `Broadcast created: ${title}`,
      metadata: {
        jobId,
        title,
        segment,
        total: users.length,
        hasImage: !!image,
        hasCustomButtons: customButtons.length > 0,
        action: 'job_created'
      }
    });

    return NextResponse.json({ success: true, jobId, total: users.length });
  } catch (error) {
    console.error('Broadcast creation error:', error);
    return NextResponse.json({ success: false, error: 'Ошибка рассылки' }, { status: 500 });
  }
}




