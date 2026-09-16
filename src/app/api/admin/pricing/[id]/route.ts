import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'pricing.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id } = await params;
  return NextResponse.json({ success: true, id });
}
