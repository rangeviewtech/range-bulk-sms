import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, Prisma, SenderIdStatus } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { logAudit } from '@/lib/security/audit';

const approveSchema = z.object({
  action: z.enum(['approve', 'reject', 'suspend']),
  reason: z.string().trim().max(500).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await hasPermission(session.userId, 'sender_ids.approve'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = approveSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid approval payload', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { action, reason } = parseResult.data;

    const existing = await prisma.senderId.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Sender ID not found' }, { status: 404 });
    }

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
      data: dataUpdate,
    });

    await logAudit({
      action: 'ADMIN_ACTION',
      userId: session.userId,
      category: 'SECURITY',
      operation: 'UPDATE',
      resourceType: 'SenderId',
      resourceId: id,
      metadata: { action, reason, previousStatus: existing.status, newStatus: updated.status },
    });

    return NextResponse.json({ success: true, senderId: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update sender ID status';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
