import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { AppError } from '@/lib/errors';
import { JobWorker } from '@/lib/queue/worker';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('campaigns.manage');
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id, deletedAt: null },
      include: { groups: true }
    });

    if (!campaign || campaign.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    if (!['DRAFT', 'SCHEDULED', 'PAUSED'].includes(campaign.status)) {
      return NextResponse.json({ success: false, error: `Campaign cannot be launched from state: ${campaign.status}` }, { status: 400 });
    }

    if (campaign.groups.length === 0) {
      return NextResponse.json({ success: false, error: 'Cannot launch campaign with no contact groups attached' }, { status: 400 });
    }

    if (!campaign.senderIdId) {
      return NextResponse.json({ success: false, error: 'A Sender ID is required to launch' }, { status: 400 });
    }

    // 1. Transition state
    // If it was PAUSED, we resume it. If it's a DRAFT, it's PREPARING
    const nextState = campaign.status === 'PAUSED' ? 'RESUMING' : 'PREPARING';

    const updated = await prisma.campaign.update({
      where: { id },
      data: { status: nextState }
    });

    // 2. Queue the background expansion job
    await JobWorker.enqueue("campaign.expand", { campaignId: id }, {
      queue: "campaign-expansion",
      priority: "HIGH",
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error) {
    console.error('[CAMPAIGN_LAUNCH_ERROR]', error);
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
