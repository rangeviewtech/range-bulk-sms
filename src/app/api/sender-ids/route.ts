import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { successResponse, errorResponse } from '@/lib/api';
import { senderIdApplicationSchema } from '@/lib/validations/sender-id';

export async function GET(_req: NextRequest) {
  try {
    const session = await requirePermission('sender_ids.view');
    
    const senderIds = await prisma.senderId.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(senderIds);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission('sender_ids.manage');
    const body = await req.json();
    const data = senderIdApplicationSchema.parse(body);

    const existing = await prisma.senderId.findUnique({
      where: {
        senderId_userId: {
          senderId: data.senderId,
          userId: session.userId
        }
      }
    });

    if (existing) {
      return errorResponse(new Error('You already have a Sender ID with this name.'), 400);
    }

    const senderId = await prisma.senderId.create({
      data: {
        ...data,
        userId: session.userId,
        status: 'PENDING'
      }
    });

    return successResponse(senderId, 'Sender ID application submitted successfully', 201);
  } catch (error) {
    return errorResponse(error);
  }
}
