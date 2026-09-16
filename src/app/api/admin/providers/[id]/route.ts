import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { smsProviderSchema } from '@/lib/validations/sender-id';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'providers.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = smsProviderSchema.parse(body);
    return NextResponse.json({ success: true, id, data: parsed });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 } as any);
  }
}
