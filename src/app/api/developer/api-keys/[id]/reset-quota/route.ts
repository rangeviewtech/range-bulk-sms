import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';
import { resetApiKeyQuota } from '@/lib/api-keys/service';
import { AppError } from '@/lib/errors';

export async function POST(
  _req: NextRequest,
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

    const result = await resetApiKeyQuota(id);

    return NextResponse.json({
      success: true,
      message: 'API key quota usage has been reset to 0',
      data: {
        id,
        quotaUsed: 0,
        quotaResetAt: result.nextResetAt,
      },
    });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
