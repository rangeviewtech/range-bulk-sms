import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { smsPricingSchema } from '@/lib/validations/wallet';

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await hasPermission(session.userId, 'pricing.manage'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';

  const pricing = await prisma.smsPricing.findMany({
    where: search ? {
      OR: [
        { countryName: { contains: search, mode: 'insensitive' } },
        { countryCode: { contains: search, mode: 'insensitive' } },
        { networkName: { contains: search, mode: 'insensitive' } },
      ]
    } : undefined,
    orderBy: [
      { countryName: 'asc' },
      { networkCode: 'asc' }
    ]
  });

  return NextResponse.json({ pricing });
}

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await hasPermission(session.userId, 'pricing.manage'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = smsPricingSchema.parse(body);

    const created = await prisma.smsPricing.create({
      data: {
        countryCode: data.countryCode,
        countryName: data.countryName,
        networkCode: data.networkCode || null,
        networkName: data.networkName || null,
        costPerSms: data.costPerSms,
        sellingPrice: data.sellingPrice,
        currency: data.currency,
      }
    });

    return NextResponse.json({ success: true, pricing: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create pricing rule';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
