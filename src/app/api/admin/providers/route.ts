import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { smsProviderSchema } from '@/lib/validations/sender-id';

export async function GET(_req: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await hasPermission(session.userId, 'providers.manage'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const providers = await prisma.smsProvider.findMany({
    orderBy: { priority: 'asc' }
  });
  return NextResponse.json({ providers });
}

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await hasPermission(session.userId, 'providers.manage'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = smsProviderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { name, displayName, type, baseUrl, apiKey, apiSecret, priority, costPerSms, supportsDlr, maxThroughput } = parsed.data;

    const provider = await prisma.smsProvider.create({
      data: {
        name: name.toLowerCase().replace(/\s+/g, '-'),
        displayName,
        type,
        baseUrl: baseUrl || '',
        apiKey,
        apiSecret,
        priority: Number(priority),
        costPerSms: Number(costPerSms),
        supportsDlr: Boolean(supportsDlr),
        maxThroughput: Number(maxThroughput),
        isActive: true,
      }
    });

    return NextResponse.json({ success: true, provider });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create provider';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
