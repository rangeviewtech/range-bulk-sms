import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'audit_logs.read') || await hasPermission(session.userId, 'settings.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q');
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

  const logs = await prisma.auditLog.findMany({
    where: search ? {
      OR: [
        { eventName: { contains: search, mode: 'insensitive' } },
        { resourceType: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    } : undefined,
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { recordedAt: 'desc' },
    take: limit
  });

  return NextResponse.json({ logs });
}
