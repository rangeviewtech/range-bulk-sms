import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';
import { AppError } from '@/lib/errors';

const mutationSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('mark-all-read') }).strict(),
  z.object({ action: z.literal('mark-read'), id: z.string().uuid() }).strict(),
]);

function failure(error: unknown) {
  const status = error instanceof AppError ? error.statusCode : 500;
  return NextResponse.json(
    {
      success: false,
      error:
        status < 500 && error instanceof Error ? error.message : 'Unable to process notifications.',
    },
    { status }
  );
}

export async function GET() {
  try {
    const session = await requireAuth();
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.userId, archivedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.notification.count({
        where: { userId: session.userId, readAt: null, archivedAt: null },
      }),
    ]);
    return NextResponse.json(
      { success: true, notifications, unreadCount },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAuth();
    const parsed = mutationSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: 'Invalid notification action.' },
        { status: 400 }
      );
    await prisma.notification.updateMany({
      where: {
        userId: session.userId,
        readAt: null,
        archivedAt: null,
        ...(parsed.data.action === 'mark-read' ? { id: parsed.data.id } : {}),
      },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return failure(error);
  }
}
