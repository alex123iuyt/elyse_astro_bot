import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../../lib/database';

export const runtime = 'nodejs';

// GET - получение деталей ошибок для конкретной рассылки
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const p = (ctx.params as any)?.then ? await (ctx.params as Promise<{ id: string }>) : (ctx.params as { id: string });
    const jobId = parseInt(p.id, 10);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ success: false, error: 'invalid_job_id' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Проверяем существование рассылки
    const job = await db.get(`SELECT * FROM broadcast_jobs WHERE id = ?`, [jobId]);
    if (!job) {
      return NextResponse.json({ success: false, error: 'job_not_found' }, { status: 404 });
    }

    // Получаем детали ошибок
    const errors = await db.all(`
      SELECT 
        br.id,
        br.telegram_id,
        br.error,
        br.status,
        br.sent_at,
        br.bot_user_id,
        bu.name as user_name,
        bu.telegram_id as user_telegram_id
      FROM broadcast_recipients br
      LEFT JOIN bot_users bu ON br.bot_user_id = bu.id
      WHERE br.job_id = ? AND br.status = 'failed'
      ORDER BY br.id DESC
    `, [jobId]);

    // Получаем общую статистику
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_recipients,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_count,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count
      FROM broadcast_recipients 
      WHERE job_id = ?
    `, [jobId]);

    return NextResponse.json({ 
      success: true, 
      job: {
        id: job.id,
        title: job.title,
        text: job.text,
        status: job.status,
        created_at: job.created_at
      },
      errors,
      stats
    });

  } catch (e: any) {
    console.error('Error getting job errors:', e);
    return NextResponse.json({ success: false, error: 'internal_error' }, { status: 500 });
  }
}






