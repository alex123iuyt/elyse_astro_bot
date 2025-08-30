import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../lib/database';

export const runtime = 'nodejs';

// PUT - обновление статуса рассылки (отмена, пауза)
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const p = (ctx.params as any)?.then ? await (ctx.params as Promise<{ id: string }>) : (ctx.params as { id: string });
    const jobId = parseInt(p.id, 10);
    
    if (isNaN(jobId)) {
      return NextResponse.json({ success: false, error: 'invalid_job_id' }, { status: 400 });
    }

    const { action } = await req.json();
    
    if (!action || !['cancel', 'pause', 'resume', 'delete'].includes(action)) {
      return NextResponse.json({ success: false, error: 'invalid_action' }, { status: 400 });
    }

    const db = await getDatabase();
    
    // Проверяем существование рассылки
    const job = await db.get(`SELECT * FROM broadcast_jobs WHERE id = ?`, [jobId]);
    if (!job) {
      return NextResponse.json({ success: false, error: 'job_not_found' }, { status: 404 });
    }

    let newStatus = job.status;
    let message = '';

    switch (action) {
      case 'cancel':
        if (job.status === 'queued' || job.status === 'running') {
          newStatus = 'cancelled';
          message = 'Рассылка отменена';
        } else {
          return NextResponse.json({ success: false, error: 'cannot_cancel_completed_job' }, { status: 400 });
        }
        break;
        
      case 'pause':
        if (job.status === 'running') {
          newStatus = 'paused';
          message = 'Рассылка приостановлена';
        } else {
          return NextResponse.json({ success: false, error: 'cannot_pause_job' }, { status: 400 });
        }
        break;
        
      case 'resume':
        if (job.status === 'paused') {
          newStatus = 'queued';
          message = 'Рассылка возобновлена';
        } else {
          return NextResponse.json({ success: false, error: 'cannot_resume_job' }, { status: 400 });
        }
        break;
        
      case 'delete':
        if (job.status === 'queued' || job.status === 'cancelled' || job.status === 'failed') {
          // Удаляем рассылку и всех получателей
          await db.run(`DELETE FROM broadcast_recipients WHERE job_id = ?`, [jobId]);
          await db.run(`DELETE FROM broadcast_jobs WHERE id = ?`, [jobId]);
          return NextResponse.json({ success: true, message: 'Рассылка удалена' });
        } else {
          return NextResponse.json({ success: false, error: 'cannot_delete_active_job' }, { status: 400 });
        }
    }

    // Обновляем статус
    await db.run(`UPDATE broadcast_jobs SET status = ? WHERE id = ?`, [newStatus, jobId]);
    
    return NextResponse.json({ 
      success: true, 
      message,
      newStatus 
    });

  } catch (e: any) {
    console.error('Error managing broadcast job:', e);
    return NextResponse.json({ success: false, error: 'internal_error' }, { status: 500 });
  }
}

// DELETE - удаление рассылки
export async function DELETE(
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

    // Проверяем, можно ли удалить
    if (job.status === 'running' || job.status === 'done') {
      return NextResponse.json({ success: false, error: 'cannot_delete_active_job' }, { status: 400 });
    }

    // Удаляем рассылку и всех получателей
    await db.run(`DELETE FROM broadcast_recipients WHERE job_id = ?`, [jobId]);
    await db.run(`DELETE FROM broadcast_jobs WHERE id = ?`, [jobId]);
    
    return NextResponse.json({ success: true, message: 'Рассылка удалена' });

  } catch (e: any) {
    console.error('Error deleting broadcast job:', e);
    return NextResponse.json({ success: false, error: 'internal_error' }, { status: 500 });
  }
}



