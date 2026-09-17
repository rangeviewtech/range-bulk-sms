import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { AgentService } from '@/lib/agent/service';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await AgentService.getOrCreateAgent(session.userId);
    const overview = await AgentService.getOverview(agent.id);

    return NextResponse.json({ overview, agent });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
