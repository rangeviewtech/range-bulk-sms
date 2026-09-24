import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { AppError } from '@/lib/errors';

export async function POST(
  _req: Request,
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

    if (!['PREPARING', 'RUNNING'].includes(campaign.status)) {
      return NextResponse.json({ success: false, error: 'Only actively preparing or running campaigns can be paused' }, { status: 400 });
    }

    // Mark as PAUSING. 
    // The sms-dispatcher checks if campaign is PAUSED, so actually PAUSING transitions quickly to PAUSED 
    // when the worker detects it, or we can just immediately mark it PAUSED and the dispatcher will abort.
    // For simplicity, we just mark it PAUSED directly, meaning the dispatcher will skip sending.
    
    await prisma.campaign.update({
      where: { id },
      data: {
        status: 'PAUSED',
      }
    });

    return NextResponse.json({ success: true, status: 'PAUSED' });
  } catch (error) {
    console.error('[CAMPAIGN_PAUSE_ERROR]', error);
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
