import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'commissions.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const { action } = body;

    const commission = await prisma.commission.findUnique({ where: { id } });
    if (!commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }

    if (action === 'approve') {
      const updated = await prisma.commission.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: session.userId,
        }
      });
      return NextResponse.json({ success: true, commission: updated });
    }

    if (action === 'pay') {
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.commission.update({
          where: { id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          }
        });

        // Credit agent wallet
        const wallet = await tx.wallet.findFirst({ where: { agentId: commission.agentId } });
        if (wallet) {
          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: commission.amount } }
          });
        }

        return updated;
      });

      return NextResponse.json({ success: true, commission: result });
    }

    return NextResponse.json({ error: 'Invalid action. Use "approve" or "pay"' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update commission';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
