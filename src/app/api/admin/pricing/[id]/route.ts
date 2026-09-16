import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'pricing.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
    return NextResponse.json({ success: true, pricing: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update pricing rule';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'pricing.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id } = await params;
  try {
    await prisma.smsPricing.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete pricing rule';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
