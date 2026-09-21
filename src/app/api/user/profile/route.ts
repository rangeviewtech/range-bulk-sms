import { NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/dal';
import { AppError } from '@/lib/errors';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(70).optional(),
  emailAddress: z.string().trim().email().optional(),
  companyName: z.string().trim().max(100).optional(),
  defaultSenderId: z.string().trim().max(11).regex(/^[a-zA-Z0-9]+$/).optional(),
  webhookUrl: z.string().trim().url().optional().or(z.literal('')),
});

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { client: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const clientMeta = (user.client?.metadata as Record<string, unknown>) || {};
    const defaultSenderId = (clientMeta.defaultSenderId as string) || 'RANGESMS';
    const webhookUrl = (clientMeta.webhookUrl as string) || '';

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.name || '',
        emailAddress: user.email,
        phone: user.phone || '',
        companyName: user.client?.companyName || '',
        status: user.status,
        mfaEnabled: user.mfaEnabled,
        defaultSenderId,
        webhookUrl,
      },
    });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json().catch(() => ({}));

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { fullName, emailAddress, companyName, defaultSenderId, webhookUrl } = parsed.data;

    await prisma.$transaction(async (tx) => {
      // 1. Update user fields
      const userUpdate: Prisma.UserUpdateInput = {};
      if (fullName !== undefined) userUpdate.name = fullName;
      if (emailAddress !== undefined) {
        const existing = await tx.user.findFirst({
          where: { email: emailAddress, NOT: { id: session.userId } },
        });
        if (existing) {
          throw new AppError('Email address is already in use by another account', 400);
        }
        userUpdate.email = emailAddress;
      }

      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: session.userId },
          data: userUpdate,
        });
      }

      // 2. Update or create client record for company & SMS preferences
      const existingClient = await tx.client.findUnique({
        where: { userId: session.userId },
      });

      const currentMeta = (existingClient?.metadata as Record<string, unknown>) || {};
      const newMeta = {
        ...currentMeta,
        ...(defaultSenderId !== undefined ? { defaultSenderId } : {}),
        ...(webhookUrl !== undefined ? { webhookUrl } : {}),
      };

      if (existingClient) {
        await tx.client.update({
          where: { id: existingClient.id },
          data: {
            ...(companyName !== undefined ? { companyName } : {}),
            metadata: newMeta as Prisma.InputJsonValue,
          },
        });
      } else if (companyName !== undefined || defaultSenderId !== undefined || webhookUrl !== undefined) {
        await tx.client.create({
          data: {
            userId: session.userId,
            companyName: companyName || null,
            metadata: newMeta as Prisma.InputJsonValue,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile settings updated successfully',
    });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
