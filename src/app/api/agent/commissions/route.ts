import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { AgentService } from '@/lib/agent/service';
import { CommissionStatus } from '@/generated/prisma/client';

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');

    const agent = await AgentService.getOrCreateAgent(session.userId);
    const status = statusParam && Object.values(CommissionStatus).includes(statusParam as CommissionStatus)
      ? (statusParam as CommissionStatus)
      : undefined;

    const commissions = await AgentService.getCommissions(agent.id, status);

    return NextResponse.json({ commissions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
