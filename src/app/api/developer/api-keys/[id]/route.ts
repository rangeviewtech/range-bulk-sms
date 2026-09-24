import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';
import { AppError } from '@/lib/errors';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const existing = await prisma.apiKey.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'API key not found' }, { status: 404 });
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: { id: updated.id, status: updated.status } });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
