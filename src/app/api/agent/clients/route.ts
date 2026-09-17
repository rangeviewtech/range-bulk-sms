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
    const clients = await AgentService.getClients(agent.id);

    return NextResponse.json({ clients });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
