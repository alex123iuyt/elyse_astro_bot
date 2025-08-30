import { NextRequest } from 'next/server';
import { getDatabase } from '../../../../../lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(_req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const db = await getDatabase();
      let lastCount = 0;
      let closed = false;
      const cleanup = () => { if (closed) return; closed = true; try { clearInterval(interval); } catch {} try { controller.close(); } catch {} };
      const push = (s: string) => { if (closed) return; try { controller.enqueue(encoder.encode(s)); } catch { cleanup(); } };
      const tick = async () => {
        if (closed) return;
        const row: any = await db.get(`SELECT COUNT(*) as c FROM messages`);
        if (row?.c !== lastCount) {
          lastCount = row.c;
          push(`event: messages\ndata: {"count": ${row.c}}\n\n`);
        } else {
          push(`event: ping\ndata: ok\n\n`);
        }
      };
      const interval = setInterval(tick, 2000);
      await tick();
    }
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' } });
}


