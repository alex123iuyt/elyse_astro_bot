import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../lib/database';

const BOT_TOKEN = process.env.BOT_TOKEN || '';

// Добавляем детальное логирование
function log(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] BROADCAST_PROCESS: ${message}`, data || '');
}

function isValidHttpUrl(url?: string) {
  if (!url || typeof url !== 'string') return false;
  
  // Убираем пробелы
  const cleanUrl = url.trim();
  if (!cleanUrl) return false;
  
  // Автоматически добавляем https:// если протокол не указан
  let processedUrl = cleanUrl;
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    processedUrl = `https://${cleanUrl}`;
  }
  
  try {
    const u = new URL(processedUrl);
    
    // Проверяем что это валидный HTTP/HTTPS URL
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return false;
    }
    
    // Разрешаем localhost с любым портом
    if (u.hostname === 'localhost') {
      return true;
    }
    
    // Разрешаем IP адреса (для тестирования)
    if (/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)) {
      return true;
    }
    
    // Для доменов проверяем минимальную валидность
    const hostname = u.hostname;
    if (hostname.length > 0 && hostname.length < 253) {
      // Разрешаем домены без точки (например, localhost, test)
      if (hostname === 'localhost' || hostname === 'test' || hostname === 'dev') {
        return true;
      }
      // Для обычных доменов проверяем наличие точки
      if (hostname.includes('.')) {
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

async function sendTelegram(telegramId: string, text: string, extra?: { 
  buttonText?: string; 
  buttonUrl?: string; 
  parseMode?: string;
  hasImage?: boolean;
  imageUrl?: string;
  customButtons?: Array<{text: string, url: string}>;
}) {
  if (!BOT_TOKEN || !telegramId) {
    log(`Missing BOT_TOKEN or telegramId: token=${!!BOT_TOKEN}, telegramId=${telegramId}`);
    return { ok: false, error: 'missing_token_or_chat' };
  }
  
  try {
    let payload: any = { chat_id: telegramId };
    
    // Если есть картинка, отправляем фото с подписью
    if (extra?.hasImage) {
      // Отправляем фото с подписью
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const photoUrl = extra?.imageUrl ? `${baseUrl}${extra.imageUrl}` : 'https://via.placeholder.com/400x300/1f2937/ffffff?text=Broadcast+Image';
      
      payload = { 
        chat_id: telegramId, 
        photo: photoUrl,
        caption: text
      };
      if (extra?.parseMode) payload.parse_mode = extra.parseMode;
    } else {
      // Иначе отправляем обычное текстовое сообщение
      payload = { chat_id: telegramId, text };
      if (extra?.parseMode) payload.parse_mode = extra.parseMode;
    }
    
    // Настраиваем кнопки
    if (extra?.customButtons && extra.customButtons.length > 0) {
      console.log('[SEND_TELEGRAM] Processing custom buttons:', extra.customButtons);
      
      // Кастомные кнопки - фильтруем только валидные URL и обрабатываем их
      const validButtons = extra.customButtons
        .filter(btn => {
          const isValid = btn.text && btn.url && isValidHttpUrl(btn.url);
          console.log(`[SEND_TELEGRAM] Button validation: text="${btn.text}", url="${btn.url}", isValid=${isValid}`);
          return isValid;
        })
        .map(btn => {
          // Автоматически добавляем https:// если протокол не указан
          let processedUrl = btn.url;
          if (!btn.url.startsWith('http://') && !btn.url.startsWith('https://')) {
            processedUrl = `https://${btn.url}`;
          }
          
          return [{
            text: btn.text,
            url: processedUrl
          }];
        });
      
      if (validButtons.length > 0) {
        payload.reply_markup = { inline_keyboard: validButtons };
        console.log('[SEND_TELEGRAM] Adding custom buttons to payload:', payload.reply_markup);
        console.log('[SEND_TELEGRAM] Final payload structure:', JSON.stringify(payload, null, 2));
      } else {
        console.log('[SEND_TELEGRAM] No valid custom buttons found after filtering');
      }
    } else {
      console.log('[SEND_TELEGRAM] No custom buttons provided, extra:', extra);
    }
    
    log(`Sending to telegram_id=${telegramId}`, { 
      payload, 
      hasButton: !!(extra?.customButtons && extra.customButtons.length > 0),
      hasImage: extra?.hasImage
    });
    
    // Выбираем правильный API endpoint
    const endpoint = extra?.hasImage ? 'sendPhoto' : 'sendMessage';
    const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await resp.json();
    log(`Telegram API response for ${telegramId}:`, { ok: data.ok, error: data.description, status: resp.status });
    
    return { ok: !!data.ok, error: data.description };
  } catch (e: any) {
    log(`Telegram send error for ${telegramId}:`, { error: e?.message, stack: e?.stack });
    return { ok: false, error: e?.message || 'network' };
  }
}

// Trigger background processing loop (idempotent)
export async function POST(req: NextRequest) {
  try {
    log('Starting broadcast processing...');
    
    const db = await getDatabase();
    const job = await db.get(`SELECT * FROM broadcast_jobs WHERE status IN ('queued','running') ORDER BY created_at LIMIT 1`);
    
    if (!job) {
      log('No jobs to process');
      return NextResponse.json({ success: true, message: 'no_jobs' });
    }

    log(`Processing job ${job.id}:`, { 
      title: job.title, 
      status: job.status, 
      total: job.total,
      sent: job.sent || 0,
      failed: job.failed || 0
    });

                // Проверяем, не обрабатывается ли уже этот job
    if (job.status === 'running') {
      const lastUpdate = new Date(job.started_at || job.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
      
      // Если job запущен менее 2 минут назад, не обрабатываем его снова
      if (diffMinutes < 2) {
        log(`Job ${job.id} is already being processed (started ${diffMinutes.toFixed(1)} minutes ago)`);
        return NextResponse.json({ success: true, message: 'already_processing' });
      }
    }

    // Дополнительная проверка - не обрабатываем job, если он уже завершен
    if (job.status === 'done' || job.status === 'failed') {
      log(`Job ${job.id} is already ${job.status}, skipping processing`);
      return NextResponse.json({ success: true, message: 'job_already_completed' });
    }

    // Проверяем, можно ли обрабатывать job
    if (job.status === 'cancelled' || job.status === 'paused') {
      log(`Job ${job.id} is ${job.status}, skipping processing`);
      return NextResponse.json({ success: true, message: 'job_not_processable' });
    }

    // Проверяем, не был ли job отменен или приостановлен во время проверки
    const currentJobStatus = await db.get(`SELECT status FROM broadcast_jobs WHERE id = ?`, [job.id]);
    if (currentJobStatus && (currentJobStatus.status === 'cancelled' || currentJobStatus.status === 'paused')) {
      log(`Job ${job.id} was ${currentJobStatus.status} during status check, skipping processing`);
      return NextResponse.json({ success: true, message: 'job_modified_during_check' });
    }

    if (job.status === 'queued') {
      await db.run(`UPDATE broadcast_jobs SET status = 'running', started_at = CURRENT_TIMESTAMP WHERE id = ?`, [job.id]);
      log(`Job ${job.id} status updated to running`);
    }

    const recipients = await db.all(`SELECT * FROM broadcast_recipients WHERE job_id = ? AND status = 'pending' LIMIT 50`, [job.id]);
    log(`Found ${recipients.length} pending recipients for job ${job.id}`);
    
    // Дополнительная проверка - если нет получателей, завершаем job
    if (recipients.length === 0) {
      // Проверяем, есть ли вообще получатели для этого job
      const totalRecipients = await db.get(`SELECT COUNT(*) as count FROM broadcast_recipients WHERE job_id = ?`, [job.id]);
      const sentRecipients = await db.get(`SELECT COUNT(*) as count FROM broadcast_recipients WHERE job_id = ? AND status = 'sent'`, [job.id]);
      const failedRecipients = await db.get(`SELECT COUNT(*) as count FROM broadcast_recipients WHERE job_id = ? AND status = 'failed'`, [job.id]);
      
      log(`Job ${job.id} has no pending recipients. Total: ${totalRecipients.count}, Sent: ${sentRecipients.count}, Failed: ${failedRecipients.count}`);
      
      // Если все получатели обработаны, завершаем job
      if (totalRecipients.count > 0 && (sentRecipients.count + failedRecipients.count) >= totalRecipients.count) {
        await db.run(`UPDATE broadcast_jobs SET status = 'done', finished_at = CURRENT_TIMESTAMP WHERE id = ?`, [job.id]);
        log(`Job ${job.id} marked as done - all recipients processed`);
        return NextResponse.json({ success: true, message: 'done', stats: { total: totalRecipients.count, sent: sentRecipients.count, failed: failedRecipients.count } });
      }
    }
    
    // Убираем дублирующийся код - проверка уже сделана выше

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const r of recipients) {
      try {
        log(`Processing recipient ${r.id} (telegram_id: ${r.telegram_id})`);
        
        const filter = job.filter ? JSON.parse(job.filter) : {};
        log(`Filter for recipient ${r.id}:`, filter);
        
        console.log('[BROADCAST_PROCESS] Sending with filter:', filter);
        console.log('[BROADCAST_PROCESS] customButtons from filter:', filter.customButtons);
        console.log('[BROADCAST_PROCESS] customButtons type:', typeof filter.customButtons);
        console.log('[BROADCAST_PROCESS] customButtons length:', filter.customButtons?.length);
        
        const result = await sendTelegram(String(r.telegram_id || ''), job.text, {
          buttonText: filter.buttonText,
          buttonUrl: filter.buttonUrl,
          parseMode: filter.parseMode,
          hasImage: filter.hasImage,
          imageUrl: filter.imageUrl,
          customButtons: filter.customButtons
        });
        
        if (result.ok) {
          await db.run(`UPDATE broadcast_recipients SET status = 'sent', sent_at = CURRENT_TIMESTAMP WHERE id = ?`, [r.id]);
          await db.run(`UPDATE broadcast_jobs SET sent = COALESCE(sent, 0) + 1 WHERE id = ?`, [job.id]);
          successCount++;
          log(`Recipient ${r.id} sent successfully`);
        } else {
          await db.run(`UPDATE broadcast_recipients SET status = 'failed', error = ? WHERE id = ?`, [result.error || 'unknown', r.id]);
          await db.run(`UPDATE broadcast_jobs SET failed = COALESCE(failed, 0) + 1 WHERE id = ?`, [job.id]);
          errorCount++;
          log(`Recipient ${r.id} failed:`, { error: result.error });
        }
        
        processedCount++;
      } catch (recipientError: any) {
        log(`Error processing recipient ${r.id}:`, { error: recipientError?.message, stack: recipientError?.stack });
        await db.run(`UPDATE broadcast_recipients SET status = 'failed', error = ? WHERE id = ?`, [recipientError?.message || 'processing_error', r.id]);
        await db.run(`UPDATE broadcast_jobs SET failed = COALESCE(failed, 0) + 1 WHERE id = ?`, [job.id]);
        errorCount++;
        processedCount++;
      }
    }

    log(`Job ${job.id} batch completed:`, { 
      processed: processedCount, 
      success: successCount, 
      error: errorCount 
    });

    return NextResponse.json({ 
      success: true, 
      processed: processedCount,
      successCount: successCount,
      errors: errorCount
    });
  } catch (e: any) {
    log('Critical processing error:', { error: e?.message, stack: e?.stack });
    return NextResponse.json({ success: false, error: 'processing_error' }, { status: 500 });
  }
}


