import { NextRequest } from 'next/server';
import { getDatabase } from '../../../../../../lib/database';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> | { id: string } }) {
  const encoder = new TextEncoder();
  const p = (ctx.params as any)?.then ? await (ctx.params as Promise<{ id: string }>) : (ctx.params as { id: string });
  const jobId = parseInt(p.id, 10);

  const stream = new ReadableStream({
    async start(controller) {
      const db = await getDatabase();
      let lastSent = '';
      let closed = false;
      let interval: any = null;

      const cleanup = () => {
        if (closed) return;
        closed = true;
        try { if (interval) clearInterval(interval); } catch {}
        try { controller.close(); } catch {}
      };

      req.signal.addEventListener('abort', cleanup);

      const push = (event: string, data: any) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          cleanup();
        }
      };

      const tick = async () => {
        if (closed) return;
        const job = await db.get(
          `SELECT id, title, text, total, sent, failed, status, created_at, started_at, finished_at FROM broadcast_jobs WHERE id = ?`,
          [jobId]
        );
        if (!job) {
          push('error', { error: 'not_found' });
          cleanup();
          return;
        }
        const payload = JSON.stringify(job);
        if (payload !== lastSent) {
          lastSent = payload;
          push('progress', job);
        } else {
          push('ping', { t: Date.now() });
        }
        if (job.status === 'done' || job.status === 'failed') cleanup();
      };

      interval = setInterval(tick, 1000);
      await tick();
    },
    cancel() {
      // Ensure timers are cleared if reader cancels
      // The actual cleanup is handled in start via closure
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
}


