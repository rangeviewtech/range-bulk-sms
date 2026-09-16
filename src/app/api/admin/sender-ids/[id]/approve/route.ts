import { NextResponse } from 'next/server';
import { prisma, Prisma, SenderIdStatus } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { senderIdActionSchema } from '@/lib/validations/sender-id';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'sender_ids.approve'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const { action, reason } = body;

    let dataUpdate: Prisma.SenderIdUpdateInput = {};

    if (action === 'approve') {
      dataUpdate = {
        status: SenderIdStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: session.userId,
      };
    } else if (action === 'reject') {
      dataUpdate = {
        status: SenderIdStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: reason || 'Rejected by Administrator',
      };
    } else if (action === 'suspend') {
      dataUpdate = { status: SenderIdStatus.SUSPENDED };
    }

    const updated = await prisma.senderId.update({
      where: { id },
      data: dataUpdate
    });

    return NextResponse.json({ success: true, senderId: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update sender ID status';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
