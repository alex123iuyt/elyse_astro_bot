import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, logBroadcast } from '../../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { action, days = 7 } = await request.json();
    const db = await getDatabase();

    let affectedRows = 0;
    let message = '';

    switch (action) {
      case 'cancel_old':
        // Отменяем старые рассылки (по умолчанию старше 7 дней)
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - days);
        
        const result = await db.run(`
          UPDATE broadcast_jobs 
          SET status = 'cancelled', updated_at = datetime('now') 
          WHERE status IN ('queued', 'running', 'paused') 
          AND created_at < ?
        `, [oldDate.toISOString()]);
        
        affectedRows = result.changes || 0;
        message = `Отменено ${affectedRows} старых рассылок (старше ${days} дней)`;
        
        await logBroadcast({
          level: 'INFO',
          message: `Bulk action: cancelled ${affectedRows} old broadcasts (older than ${days} days)`,
          metadata: {
            action: 'bulk_cancel_old',
            affectedRows,
            days
          }
        });
        break;

      case 'cleanup_completed':
        // Удаляем завершенные рассылки старше 30 дней
        const cleanupDate = new Date();
        cleanupDate.setDate(cleanupDate.getDate() - 30);
        
        const deleteResult = await db.run(`
          DELETE FROM broadcast_jobs 
          WHERE status IN ('done', 'failed', 'cancelled') 
          AND created_at < ?
        `, [cleanupDate.toISOString()]);
        
        affectedRows = deleteResult.changes || 0;
        message = `Удалено ${affectedRows} завершенных рассылок (старше 30 дней)`;
        
        await logBroadcast({
          level: 'INFO',
          message: `Bulk action: cleaned up ${affectedRows} completed broadcasts (older than 30 days)`,
          metadata: {
            action: 'bulk_cleanup_completed',
            affectedRows
          }
        });
        break;

      case 'pause_all_running':
        // Приостанавливаем все активные рассылки
        const pauseResult = await db.run(`
          UPDATE broadcast_jobs 
          SET status = 'paused', updated_at = datetime('now') 
          WHERE status IN ('queued', 'running')
        `);
        
        affectedRows = pauseResult.changes || 0;
        message = `Приостановлено ${affectedRows} активных рассылок`;
        
        await logBroadcast({
          level: 'INFO',
          message: `Bulk action: paused ${affectedRows} running broadcasts`,
          metadata: {
            action: 'bulk_pause_all_running',
            affectedRows
          }
        });
        break;

      default:
        return NextResponse.json({ success: false, error: 'Неизвестное действие' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message, 
      affectedRows 
    });

  } catch (error) {
    console.error('Bulk action error:', error);
    
    await logBroadcast({
      level: 'ERROR',
      message: `Bulk action failed: ${error}`,
      metadata: {
        action: 'bulk_action_error',
        error: String(error)
      }
    });

    return NextResponse.json({ 
      success: false, 
      error: 'Ошибка выполнения операции' 
    }, { status: 500 });
  }
}