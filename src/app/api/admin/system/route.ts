import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'system.monitor'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ status: 'ok', providerHealth: [], queueStats: {} });
}
