import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logBroadcast } from '../../../../../lib/database';

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
  // Логируем токен для отладки (скрываем большую часть)
  const tokenPreview = BOT_TOKEN ? `${BOT_TOKEN.substring(0, 10)}...` : 'NOT_SET';
  log(`BOT_TOKEN status: ${tokenPreview}, telegramId: ${telegramId}`);
  
  if (!BOT_TOKEN || !telegramId) {
    log(`Missing BOT_TOKEN or telegramId: token=${!!BOT_TOKEN}, telegramId=${telegramId}`);
    await logBroadcast({
      level: 'ERROR',
      message: `Missing BOT_TOKEN or telegramId for user ${telegramId}`,
      metadata: {
        telegramId,
        hasToken: !!BOT_TOKEN,
        action: 'send_error_missing_credentials'
      }
    });
    return { ok: false, error: 'missing_token_or_chat' };
  }
  
  try {
    let payload: any = { chat_id: telegramId };
    
    // Если есть картинка, отправляем фото с подписью
    if (extra?.hasImage) {
      // Используем публичный URL через ngrok
      const publicUrl = process.env.NGROK_URL || 'https://47e2e59678b8.ngrok-free.app'; // Ваш ngrok URL
      const photoUrl = `${publicUrl}${extra.imageUrl}`;
      
      console.log('[SEND_TELEGRAM] Photo URL (ngrok):', photoUrl);
      
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

    await logBroadcast({
      level: 'INFO',
      message: `Sending message to user ${telegramId}`,
      metadata: {
        telegramId,
        hasImage: extra?.hasImage,
        hasButtons: !!(extra?.customButtons && extra.customButtons.length > 0),
        buttonsCount: extra?.customButtons?.length || 0,
        action: 'send_start'
      }
    });

    // Выбираем правильный API endpoint
    const endpoint = extra?.hasImage ? 'sendPhoto' : 'sendMessage';
    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`;

    log(`Calling Telegram API: ${apiUrl}`);

    await logBroadcast({
      level: 'INFO',
      message: `Calling Telegram API: ${endpoint}`,
      metadata: {
        telegramId,
        endpoint,
        apiUrl,
        action: 'telegram_api_call'
      }
    });

    // Обычная JSON отправка для всех случаев
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    log(`Telegram API response for ${telegramId}:`, { ok: data.ok, error: data.description, status: resp.status });

    await logBroadcast({
      level: data.ok ? 'INFO' : 'ERROR',
      message: `Telegram API response for ${telegramId}: ${data.ok ? 'SUCCESS' : 'FAILED - ' + data.description}`,
      metadata: {
        telegramId,
        success: data.ok,
        error: data.description,
        httpStatus: resp.status,
        action: data.ok ? 'send_success' : 'send_failed'
      }
    });

    return { ok: !!data.ok, error: data.description };
  } catch (e: any) {
    log(`Telegram send error for ${telegramId}:`, { error: e?.message, stack: e?.stack });
    await logBroadcast({
      level: 'ERROR',
      message: `Network error sending to ${telegramId}: ${e?.message}`,
      metadata: {
        telegramId,
        error: e?.message,
        stack: e?.stack,
        action: 'send_network_error'
      }
    });
    return { ok: false, error: e?.message || 'network' };
  }
}

// Trigger background processing loop (idempotent)
export async function POST(req: NextRequest) {
  try {
    log('Starting broadcast processing...');
    
    // Проверяем токен бота
    const tokenPreview = BOT_TOKEN ? `${BOT_TOKEN.substring(0, 10)}...` : 'NOT_SET';
    log(`BOT_TOKEN status: ${tokenPreview}`);
    
    if (!BOT_TOKEN) {
      log('ERROR: BOT_TOKEN is not set!');
      await logBroadcast({
        level: 'CRITICAL',
        message: 'BOT_TOKEN is not configured',
        metadata: { action: 'token_check_failed' }
      });
      return NextResponse.json({ success: false, error: 'BOT_TOKEN not configured' }, { status: 500 });
    }

    const db = await getDatabase();

    // Логируем начало обработки
    await logBroadcast({
      level: 'INFO',
      message: 'Broadcast processor started',
      metadata: {
        timestamp: new Date().toISOString(),
        action: 'processor_start'
      }
    });

    const job = await db.get(`SELECT * FROM broadcast_jobs WHERE status IN ('queued','running') ORDER BY created_at LIMIT 1`);

    if (!job) {
      log('No jobs to process');
      await logBroadcast({
        level: 'INFO',
        message: 'No broadcast jobs to process',
        metadata: { action: 'check_jobs' }
      });
      return NextResponse.json({ success: true, message: 'no_jobs' });
    }

    log(`Processing job ${job.id}:`, {
      title: job.title,
      status: job.status,
      total: job.total,
      sent: job.sent || 0,
      failed: job.failed || 0
    });

    // Логируем найденный job
    await logBroadcast({
      level: 'INFO',
      message: `Found broadcast job to process: ${job.title}`,
      metadata: {
        jobId: job.id,
        title: job.title,
        status: job.status,
        total: job.total,
        sent: job.sent || 0,
        failed: job.failed || 0,
        action: 'job_found'
      }
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
      await logBroadcast({
        level: 'INFO',
        message: `Broadcast job started: ${job.title}`,
        metadata: {
          jobId: job.id,
          total: job.total,
          action: 'job_started'
        }
      });
    }

    // Логируем поиск получателей
    await logBroadcast({
      level: 'INFO',
      message: `Searching for pending recipients for job ${job.id}`,
      metadata: {
        jobId: job.id,
        action: 'search_recipients'
      }
    });

    const recipients = await db.all(`SELECT id, telegram_id, user_name FROM broadcast_recipients WHERE job_id = ? AND status = 'pending' LIMIT 50`, [job.id]);
    log(`Found ${recipients.length} pending recipients for job ${job.id}`);
    
    // Дополнительная отладка - проверяем все получатели для job
    const allRecipients = await db.all(`SELECT * FROM broadcast_recipients WHERE job_id = ?`, [job.id]);
    log(`Total recipients for job ${job.id}: ${allRecipients.length}`);
    if (allRecipients.length > 0) {
      log(`Recipients details:`, allRecipients);
    }

    await logBroadcast({
      level: 'INFO',
      message: `Found ${recipients.length} pending recipients for job ${job.id}`,
      metadata: {
        jobId: job.id,
        recipientsCount: recipients.length,
        action: 'recipients_found'
      }
    });
    
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
        await logBroadcast({
          level: 'INFO',
          message: `Broadcast job completed: ${job.title}`,
          metadata: {
            jobId: job.id,
            total: totalRecipients.count,
            sent: sentRecipients.count,
            failed: failedRecipients.count,
            action: 'job_completed'
          }
        });
        return NextResponse.json({ success: true, message: 'done', stats: { total: totalRecipients.count, sent: sentRecipients.count, failed: failedRecipients.count } });
      }
    }
    
    // Убираем дублирующийся код - проверка уже сделана выше

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    await logBroadcast({
      level: 'INFO',
      message: `Starting to process ${recipients.length} recipients for job ${job.id}`,
      metadata: {
        jobId: job.id,
        recipientsCount: recipients.length,
        action: 'processing_start'
      }
    });

    for (const r of recipients) {
      try {
        log(`Processing recipient ${r.id} (telegram_id: ${r.telegram_id})`);

        await logBroadcast({
          level: 'INFO',
          message: `Processing recipient ${r.id} (${r.telegram_id}) for job ${job.id}`,
          metadata: {
            jobId: job.id,
            recipientId: r.id,
            telegramId: r.telegram_id,
            userName: r.user_name,
            action: 'recipient_processing'
          }
        });

        const filter = job.filter ? JSON.parse(job.filter) : {};
        log(`Filter for recipient ${r.id}:`, filter);
        
        console.log('[BROADCAST_PROCESS] Sending with filter:', filter);
        console.log('[BROADCAST_PROCESS] customButtons from filter:', filter.customButtons);
        console.log('[BROADCAST_PROCESS] customButtons type:', typeof filter.customButtons);
        console.log('[BROADCAST_PROCESS] customButtons length:', filter.customButtons?.length);
        
        const result = await sendTelegram(String(r.telegram_id), job.text, {
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
          await logBroadcast({
            level: 'INFO',
            message: `Message sent successfully to ${r.telegram_id}`,
            metadata: {
              jobId: job.id,
              recipientId: r.id,
              telegramId: r.telegram_id,
              action: 'message_sent'
            }
          });
        } else {
          await db.run(`UPDATE broadcast_recipients SET status = 'failed', error = ? WHERE id = ?`, [result.error || 'unknown', r.id]);
          await db.run(`UPDATE broadcast_jobs SET failed = COALESCE(failed, 0) + 1 WHERE id = ?`, [job.id]);
          errorCount++;
          log(`Recipient ${r.id} failed:`, { error: result.error });
          await logBroadcast({
            level: 'ERROR',
            message: `Failed to send message to ${r.telegram_id}: ${result.error}`,
            metadata: {
              jobId: job.id,
              recipientId: r.id,
              telegramId: r.telegram_id,
              error: result.error,
              action: 'message_failed'
            }
          });
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

    await logBroadcast({
      level: 'INFO',
      message: `Batch completed for job ${job.id}`,
      metadata: {
        jobId: job.id,
        processed: processedCount,
        success: successCount,
        error: errorCount,
        action: 'batch_completed'
      }
    });

        // Проверяем, остались ли еще получатели для обработки
    const remainingRecipients = await db.get(`SELECT COUNT(*) as count FROM broadcast_recipients WHERE job_id = ? AND status = 'pending'`, [job.id]);
    const totalProcessed = await db.get(`SELECT COUNT(*) as count FROM broadcast_recipients WHERE job_id = ? AND status IN ('sent', 'failed')`, [job.id]);
    const totalRecipients = await db.get(`SELECT COUNT(*) as count FROM broadcast_recipients WHERE job_id = ?`, [job.id]);

    await logBroadcast({
      level: 'INFO',
      message: `Job ${job.id} status check: ${remainingRecipients.count} remaining, ${totalProcessed.count} processed, ${totalRecipients.count} total`,
      metadata: {
        jobId: job.id,
        remaining: remainingRecipients.count,
        processed: totalProcessed.count,
        total: totalRecipients.count,
        action: 'status_check'
      }
    });

    // Автоматически завершаем job если все получатели обработаны
    if (remainingRecipients.count === 0 && totalRecipients.count > 0) {
      const sentCount = await db.get(`SELECT COUNT(*) as count FROM broadcast_recipients WHERE job_id = ? AND status = 'sent'`, [job.id]);
      const failedCount = await db.get(`SELECT COUNT(*) as count FROM broadcast_recipients WHERE job_id = ? AND status = 'failed'`, [job.id]);

      await db.run(`UPDATE broadcast_jobs SET status = 'done', finished_at = CURRENT_TIMESTAMP, sent = ?, failed = ? WHERE id = ?`, [
        sentCount.count, failedCount.count, job.id
      ]);

      await logBroadcast({
        level: 'INFO',
        message: `Job ${job.id} automatically completed: ${sentCount.count} sent, ${failedCount.count} failed`,
        metadata: {
          jobId: job.id,
          sent: sentCount.count,
          failed: failedCount.count,
          action: 'job_auto_completed'
        }
      });

      log(`Job ${job.id} automatically marked as completed`);
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      successCount: successCount,
      errors: errorCount,
      remaining: remainingRecipients.count
    });
  } catch (e: any) {
    log('Critical processing error:', { error: e?.message, stack: e?.stack });
    return NextResponse.json({ success: false, error: 'processing_error' }, { status: 500 });
  }
}


