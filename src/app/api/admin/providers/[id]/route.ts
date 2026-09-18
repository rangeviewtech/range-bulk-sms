import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'providers.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await prisma.smsProvider.update({
      where: { id },
      data: {
        displayName: body.displayName,
        baseUrl: body.baseUrl,
        apiKey: body.apiKey,
        apiSecret: body.apiSecret,
        priority: body.priority !== undefined ? Number(body.priority) : undefined,
        costPerSms: body.costPerSms !== undefined ? Number(body.costPerSms) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        supportsDlr: body.supportsDlr !== undefined ? Boolean(body.supportsDlr) : undefined,
        maxThroughput: body.maxThroughput !== undefined ? Number(body.maxThroughput) : undefined,
      }
    });
    return NextResponse.json({ success: true, provider: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update provider';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'providers.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id } = await params;
  try {
    await prisma.smsProvider.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete provider';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
