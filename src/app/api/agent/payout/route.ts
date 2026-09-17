import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { AgentService } from '@/lib/agent/service';

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, method = 'Mobile Money', details = '' } = body;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: 'Invalid payout amount' }, { status: 400 });
    }

    const agent = await AgentService.getOrCreateAgent(session.userId);
    const result = await AgentService.requestPayout(agent.id, amountNum, method, details);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to request payout';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
