import { NextResponse } from 'next/server';
import { prisma, CommissionStatus } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [canView, canManage] = await Promise.all([
    hasPermission(session.userId, 'commissions.view'),
    hasPermission(session.userId, 'commissions.manage'),
  ]);
  if (!canView && !canManage) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get('status')?.toUpperCase();
  const validStatus = statusParam && Object.values(CommissionStatus).includes(statusParam as CommissionStatus)
    ? (statusParam as CommissionStatus)
    : undefined;

  const commissions = await prisma.commission.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    include: {
      agent: {
        select: {
          id: true,
          companyName: true,
          bankName: true,
          bankAccount: true,
          mobileMoney: true,
          user: { select: { name: true, email: true } }
        }
      },
      client: {
        select: { id: true, companyName: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ commissions });
}
