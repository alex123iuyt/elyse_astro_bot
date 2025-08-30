import { NextRequest, NextResponse } from 'next/server';
import { getBotUsersForBroadcast } from '../../../../lib/bot-users';

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

    // Get users from bot-users.json
    const users = await getBotUsersForBroadcast(segment, inactiveDays, zodiac);
    console.log('[BROADCAST_CREATE] Found users:', { count: users.length, segment, inactiveDays, zodiac });
    
    if (users.length === 0) {
      console.log('[BROADCAST_CREATE] No users found for broadcast');
      return NextResponse.json({ success: false, error: 'Нет пользователей для рассылки' }, { status: 400 });
    }

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
    const db = await getDatabase();
    const res = await db.run(`INSERT INTO broadcast_jobs (title, text, filter, total, status) VALUES (?, ?, ?, ?, 'queued')`, [
      title, text, JSON.stringify(payload), users.length
    ]);
    const jobId = res.lastID as number;
    console.log('[BROADCAST_CREATE] Job created:', { jobId, title, total: users.length });

    // Ensure there is an admin user id to satisfy FK (legacy schema expects FK to users)
    const admin = await db.get(`SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1`);
    const adminId = admin?.id || 1;
    console.log('[BROADCAST_CREATE] Using admin ID:', adminId);
    
    // Try to add optional column for bot user id (idempotent)
    try { await db.run(`ALTER TABLE broadcast_recipients ADD COLUMN bot_user_id TEXT`); } catch {}
    
    // Store recipients (link to admin user to satisfy FK; keep bot_user_id for actual mapping)
    console.log('[BROADCAST_CREATE] Creating recipients...');
    for (const user of users) {
      await db.run(`INSERT INTO broadcast_recipients (job_id, user_id, telegram_id, bot_user_id) VALUES (?, ?, ?, ?)`, [
        jobId, adminId, user.telegram_id, user.id
      ]);
    }
    console.log('[BROADCAST_CREATE] Recipients created successfully');
    
    return NextResponse.json({ success: true, jobId, total: users.length });
  } catch (error) {
    console.error('Broadcast creation error:', error);
    return NextResponse.json({ success: false, error: 'Ошибка рассылки' }, { status: 500 });
  }
}

// Helper function to get database
async function getDatabase() {
  const { getDatabase } = await import('../../../../lib/database');
  return getDatabase();
}


