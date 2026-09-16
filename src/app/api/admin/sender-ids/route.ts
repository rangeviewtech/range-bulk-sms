import { NextResponse } from 'next/server';
import { prisma, SenderIdStatus } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'sender_ids.view') || await hasPermission(session.userId, 'sender_ids.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
