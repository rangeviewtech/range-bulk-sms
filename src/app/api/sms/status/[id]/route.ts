import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { AppError } from '@/lib/errors';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('sms.view');
    const { id } = await params;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        recipients: {
          select: {
            phone: true,
            status: true,
            deliveredAt: true,
            failedAt: true,
            failureReason: true
          }
        }
      }
    });

    if (!message || message.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
