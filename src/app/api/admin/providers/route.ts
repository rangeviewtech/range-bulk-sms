import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { smsProviderSchema } from '@/lib/validations/sender-id';

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'providers.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return NextResponse.json({ providers: [] });
}

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'providers.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parsed = smsProviderSchema.parse(body);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 } as any);
  }
}
