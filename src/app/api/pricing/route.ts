import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q')?.trim() || '';

  try {
    let pricing = await prisma.smsPricing.findMany({
      where: {
        isActive: true,
        ...(search
          ? {
              OR: [
                { countryName: { contains: search, mode: 'insensitive' } },
                { countryCode: { contains: search, mode: 'insensitive' } },
                { networkName: { contains: search, mode: 'insensitive' } },
                { networkCode: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        countryCode: true,
        countryName: true,
        networkCode: true,
        networkName: true,
        sellingPrice: true,
        currency: true,
      },
      orderBy: [{ countryName: 'asc' }, { networkName: 'asc' }],
    });

    // Fallback default pricing if table hasn't been seeded yet
    if (pricing.length === 0 && !search) {
      return NextResponse.json({
        pricing: [
          { id: 'def-1', countryCode: '+256', countryName: 'Uganda', networkCode: 'MTN', networkName: 'MTN Uganda', sellingPrice: 45.0, currency: 'UGX' },
          { id: 'def-2', countryCode: '+256', countryName: 'Uganda', networkCode: 'AIRTEL', networkName: 'Airtel Uganda', sellingPrice: 45.0, currency: 'UGX' },
          { id: 'def-3', countryCode: '+254', countryName: 'Kenya', networkCode: 'SAFARICOM', networkName: 'Safaricom Kenya', sellingPrice: 60.0, currency: 'UGX' },
          { id: 'def-4', countryCode: '+254', countryName: 'Kenya', networkCode: 'AIRTEL', networkName: 'Airtel Kenya', sellingPrice: 58.0, currency: 'UGX' },
          { id: 'def-5', countryCode: '+255', countryName: 'Tanzania', networkCode: 'VODACOM', networkName: 'Vodacom Tanzania', sellingPrice: 65.0, currency: 'UGX' },
          { id: 'def-6', countryCode: '+250', countryName: 'Rwanda', networkCode: 'MTN', networkName: 'MTN Rwanda', sellingPrice: 65.0, currency: 'UGX' },
        ],
      });
    }

    return NextResponse.json({ pricing });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch pricing';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
