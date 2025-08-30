import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../lib/database';

export const runtime = 'nodejs';

// POST - массовые операции с рассылками
export async function POST(req: NextRequest) {
  try {
    const { action, days } = await req.json();
    
    if (!action || !['cancel_old', 'cleanup_completed', 'pause_all_running'].includes(action)) {
      return NextResponse.json({ success: false, error: 'invalid_action' }, { status: 400 });
    }

    const db = await getDatabase();
    let affectedRows = 0;
    let message = '';

    switch (action) {
      case 'cancel_old':
        const daysToCheck = days || 7; // По умолчанию 7 дней
        const result = await db.run(`
          UPDATE broadcast_jobs 
          SET status = 'cancelled' 
          WHERE status IN ('queued', 'running') 
          AND created_at < datetime('now', '-${daysToCheck} days')
        `);
        affectedRows = result.changes || 0;
        message = `Отменено ${affectedRows} старых рассылок (старше ${daysToCheck} дней)`;
        break;
        
      case 'cleanup_completed':
        // Удаляем завершенные рассылки старше 30 дней
        const cleanupResult = await db.run(`
          DELETE FROM broadcast_jobs 
          WHERE status IN ('done', 'failed', 'cancelled') 
          AND created_at < datetime('now', '-30 days')
        `);
        affectedRows = cleanupResult.changes || 0;
        message = `Удалено ${affectedRows} старых завершенных рассылок`;
        break;
        
      case 'pause_all_running':
        const pauseResult = await db.run(`
          UPDATE broadcast_jobs 
          SET status = 'paused' 
          WHERE status = 'running'
        `);
        affectedRows = pauseResult.changes || 0;
        message = `Приостановлено ${affectedRows} активных рассылок`;
        break;
    }

    return NextResponse.json({ 
      success: true, 
      message,
      affectedRows 
    });

  } catch (e: any) {
    console.error('Error in bulk operations:', e);
    return NextResponse.json({ success: false, error: 'internal_error' }, { status: 500 });
  }
}






