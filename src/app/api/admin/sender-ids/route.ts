import { NextResponse } from 'next/server';
import { prisma, SenderIdStatus } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [canView, canManage] = await Promise.all([
    hasPermission(session.userId, 'sender_ids.view'),
    hasPermission(session.userId, 'sender_ids.manage'),
  ]);
  if (!canView && !canManage) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get('status')?.toUpperCase();
  const validStatus = statusParam && Object.values(SenderIdStatus).includes(statusParam as SenderIdStatus)
    ? (statusParam as SenderIdStatus)
    : undefined;
  const search = searchParams.get('q');

  const senderIds = await prisma.senderId.findMany({
    where: {
      status: validStatus,
      senderId: search ? { contains: search, mode: 'insensitive' } : undefined,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      client: {
        select: { id: true, companyName: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ senderIds });
}
