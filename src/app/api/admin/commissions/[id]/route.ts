import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { logAudit } from '@/lib/security/audit';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await hasPermission(session.userId, 'commissions.manage'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
      if (commission.status !== 'PENDING') {
        return NextResponse.json(
          { error: `Cannot approve commission with status: ${commission.status}` },
          { status: 400 }
        );
      }

      const updated = await prisma.commission.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: session.userId,
        },
      });

      await logAudit({
        action: 'ADMIN_ACTION',
        userId: session.userId,
        category: 'ADMIN',
        operation: 'UPDATE',
        resourceType: 'Commission',
        resourceId: id,
        metadata: {
          action: 'approve',
          agentId: commission.agentId,
          amount: Number(commission.amount),
        },
      });

      return NextResponse.json({ success: true, commission: updated });
    }

    if (action === 'pay') {
      if (commission.status === 'PAID') {
        return NextResponse.json(
          { error: 'Commission has already been paid' },
          { status: 400 }
        );
      }

      if (commission.status !== 'APPROVED') {
        return NextResponse.json(
          { error: `Commission must be in APPROVED status prior to payout (current status: ${commission.status})` },
          { status: 400 }
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        // Atomic status verification inside transaction to prevent concurrent double-spend race conditions
        const target = await tx.commission.findUnique({ where: { id } });
        if (!target || target.status !== 'APPROVED') {
          throw new Error('Commission is not in an approved state for payout');
        }

        const updated = await tx.commission.update({
          where: { id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });

        // Credit agent wallet and record immutable transaction
        const wallet = await tx.wallet.findFirst({ where: { agentId: target.agentId } });
        if (wallet) {
          const balanceBefore = wallet.balance;
          const balanceAfter = Number(wallet.balance) + Number(target.amount);

          await tx.wallet.update({
            where: { id: wallet.id },
            data: { balance: { increment: target.amount } },
          });

          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              userId: session.userId,
              type: 'COMMISSION_PAYOUT',
              amount: target.amount,
              balanceBefore,
              balanceAfter,
              reference: `COMM-PAY-${target.id}-${Date.now()}`,
              description: `Commission payout for commission ID ${target.id}`,
            },
          });
        }

        return updated;
      });

      await logAudit({
        action: 'ADMIN_ACTION',
        userId: session.userId,
        category: 'ADMIN',
        operation: 'UPDATE',
        resourceType: 'Commission',
        resourceId: id,
        metadata: {
          action: 'pay',
          agentId: commission.agentId,
          amount: Number(commission.amount),
        },
      });

      return NextResponse.json({ success: true, commission: result });
    }

    return NextResponse.json({ error: 'Invalid action. Use "approve" or "pay"' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update commission';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
