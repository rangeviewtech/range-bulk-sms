import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { AppError } from '@/lib/errors';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('campaigns.manage');
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id, deletedAt: null }
    });

    if (!campaign || campaign.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    if (!['SCHEDULED', 'PROCESSING'].includes(campaign.status)) {
      return NextResponse.json({ success: false, error: 'Campaign cannot be cancelled in its current state' }, { status: 400 });
    }

    await prisma.campaign.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      }
    });

    return NextResponse.json({ success: true, status: 'CANCELLED' });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status }
    );
  }
}
