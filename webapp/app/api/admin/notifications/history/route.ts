import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const db = await getDatabase();
    const rows = await db.all(`SELECT id, title, text, total, sent, failed, status, created_at FROM broadcast_jobs ORDER BY id DESC LIMIT 100`);
    return NextResponse.json({ success: true, rows });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'history_error' }, { status: 500 });
  }
}







