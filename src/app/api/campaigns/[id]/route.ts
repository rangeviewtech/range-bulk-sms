import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { updateCampaignSchema } from '@/lib/validations/sms';
import { AppError } from '@/lib/errors';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('sms.view');
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id, deletedAt: null },
    });

    if (!campaign || campaign.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('campaigns.manage');
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const parsed = updateCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id, deletedAt: null }
    });

    if (!campaign || campaign.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'DRAFT') {
      return NextResponse.json({ success: false, error: 'Only DRAFT campaigns can be updated' }, { status: 400 });
    }

    const { name, senderId, message, variables, scheduledAt } = parsed.data;

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(message && { message }),
        ...(variables && { variables }),
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null })
      }
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status }
    );
  }
}

export async function DELETE(
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

    const allowedStatuses = ['DRAFT', 'COMPLETED', 'FAILED', 'CANCELLED'];
    if (!allowedStatuses.includes(campaign.status)) {
      return NextResponse.json({ success: false, error: 'Cannot delete campaign in current status' }, { status: 400 });
    }

    await prisma.campaign.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status }
    );
  }
}
