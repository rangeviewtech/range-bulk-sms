import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthenticatedSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { redisCache } from '@/lib/redis';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifyAuthenticatedSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await hasPermission(session.userId, 'pricing.manage'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await prisma.smsPricing.update({
      where: { id },
      data: {
        costPerSms: body.costPerSms !== undefined ? Number(body.costPerSms) : undefined,
        sellingPrice: body.sellingPrice !== undefined ? Number(body.sellingPrice) : undefined,
        currency: body.currency,
        isDefault: body.isDefault,
      }
    });
    await redisCache.delByPattern('pricing:public:*');
    return NextResponse.json({ success: true, pricing: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update pricing rule';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifyAuthenticatedSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await hasPermission(session.userId, 'pricing.manage'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  try {
    await prisma.smsPricing.delete({ where: { id } });
    await redisCache.delByPattern('pricing:public:*');
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete pricing rule';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
