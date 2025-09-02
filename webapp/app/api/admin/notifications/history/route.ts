import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const db = await getDatabase();
    const rows = await db.all(`
      SELECT
        id,
        title,
        text,
        total,
        sent,
        failed,
        status,
        created_at,
        image_url,
        custom_buttons,
        has_image,
        has_buttons
      FROM broadcast_jobs
      ORDER BY id DESC LIMIT 100
    `);

    // Parse custom buttons JSON for each row
    const processedRows = rows.map(row => ({
      ...row,
      custom_buttons: row.custom_buttons ? JSON.parse(row.custom_buttons) : null
    }));
    return NextResponse.json({ success: true, rows: processedRows });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'history_error' }, { status: 500 });
  }
}









