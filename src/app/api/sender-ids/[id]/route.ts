import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { successResponse, errorResponse } from '@/lib/api';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, props: Params) {
  try {
    const session = await requirePermission('sender_ids.view');
    const { id } = await props.params;

    const senderId = await prisma.senderId.findFirst({
      where: { id, userId: session.userId }
    });

    if (!senderId) return errorResponse(new Error('Sender ID not found'), 404);

    return successResponse(senderId);
  } catch (error) {
    return errorResponse(error);
  }
}
