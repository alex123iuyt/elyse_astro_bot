import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/database';

interface BroadcastLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  category: 'BROADCAST';
  message: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const limit = parseInt(searchParams.get('limit') || '100');

    const db = await getDatabase();

    // Получаем логи рассылок из базы данных
    let query = `
      SELECT
        'log_' || id as id,
        created_at as timestamp,
        level,
        'BROADCAST' as category,
        message,
        metadata
      FROM broadcast_logs
      ${level ? 'WHERE level = ?' : ''}
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const broadcastLogs = await db.all(query, level ? [level, limit] : [limit]);

    // Преобразуем в нужный формат
    const logs: BroadcastLog[] = broadcastLogs.map((log: any) => ({
      id: log.id,
      timestamp: log.timestamp,
      level: log.level,
      category: 'BROADCAST' as const,
      message: log.message,
      metadata: log.metadata ? JSON.parse(log.metadata) : undefined
    }));

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching broadcast logs:', error);
    return NextResponse.json({ logs: [] }, { status: 500 });
  }
}
