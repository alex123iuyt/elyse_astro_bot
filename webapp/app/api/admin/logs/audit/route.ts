import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../lib/database';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getDatabase();

    // Получаем аудит рассылок из базы данных
    const auditLogs = await db.all(`
      SELECT
        'audit_' || bj.id as id,
        bj.created_at as timestamp,
        COALESCE(u.email, 'system') as userId,
        COALESCE(u.name, 'System') as userName,
        CASE
          WHEN bj.status = 'done' THEN 'BROADCAST_COMPLETED'
          WHEN bj.status = 'failed' THEN 'BROADCAST_FAILED'
          WHEN bj.status = 'cancelled' THEN 'BROADCAST_CANCELLED'
          WHEN bj.status = 'running' THEN 'BROADCAST_STARTED'
          ELSE 'BROADCAST_CREATED'
        END as action,
        'broadcast' as resource,
        bj.id as resourceId,
        bj.title || ' (' || bj.total || ' получателей)' as details,
        NULL as ipAddress
      FROM broadcast_jobs bj
      LEFT JOIN users u ON u.role = 'admin'
      ORDER BY bj.created_at DESC
      LIMIT ?
    `, [limit]);

    return NextResponse.json({ auditLogs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ auditLogs: [] }, { status: 500 });
  }
}

