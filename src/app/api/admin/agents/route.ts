import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'agents.view') || await hasPermission(session.userId, 'agents.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ agents: [] });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'agents.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ success: true });
}
