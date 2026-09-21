import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { AgentService } from '@/lib/agent/service';
import { agentPayoutSchema } from '@/lib/validations/admin';

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = agentPayoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount, method, details } = parsed.data;

    const agent = await AgentService.getOrCreateAgent(session.userId);
    const result = await AgentService.requestPayout(agent.id, amount, method, details);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to request payout';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
