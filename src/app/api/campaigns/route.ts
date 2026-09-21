import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { createCampaignSchema } from '@/lib/validations/sms';
import { AppError } from '@/lib/errors';

export async function GET(req: Request) {
  try {
    const session = await requirePermission('sms.view');
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    const skip = (page - 1) * limit;

    const campaigns = await prisma.campaign.findMany({
      where: { userId: session.userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.campaign.count({
      where: { userId: session.userId, deletedAt: null },
    });

    return NextResponse.json({
      success: true,
      data: campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission('campaigns.create');
    const body = await req.json().catch(() => ({}));
    
    const parsed = createCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: parsed.error.format() },
        { status: 400 }
      );
    }
    
    const { name, senderId, message, variables, groupIds, scheduledAt } = parsed.data;

    let validSenderIdId: string | null = null;
    if (senderId) {
      const validSender = await prisma.senderId.findFirst({
        where: {
          OR: [{ id: senderId }, { senderId }],
          userId: session.userId,
          status: 'APPROVED',
        },
      });
      if (!validSender) {
        return NextResponse.json(
          { success: false, error: 'Specified Sender ID is invalid, unapproved, or does not belong to you' },
          { status: 400 }
        );
      }
      validSenderIdId = validSender.id;
    }

    // Validate groupIds ownership
    if (groupIds.length > 0) {
      const validGroups = await prisma.contactGroup.findMany({
        where: { id: { in: groupIds }, userId: session.userId },
        select: { id: true },
      });
      if (validGroups.length !== groupIds.length) {
        return NextResponse.json(
          { success: false, error: 'One or more contact groups do not exist or do not belong to you' },
          { status: 400 }
        );
      }
    }

    const campaign = await prisma.$transaction(async (tx) => {
      const camp = await tx.campaign.create({
        data: {
          userId: session.userId,
          name,
          senderIdId: validSenderIdId,
          message,
          variables,
          status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        }
      });

      if (groupIds.length > 0) {
        await tx.campaignGroup.createMany({
          data: groupIds.map(groupId => ({
            campaignId: camp.id,
            contactGroupId: groupId
          }))
        });
      }

      return camp;
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
