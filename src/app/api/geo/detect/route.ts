import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Geo Location & Country Detection API
 * Resolves the client machine location via edge headers, client IP, or fallback geolocation service.
 */
export async function GET(req: NextRequest) {
  const headers = req.headers;

  // 1. Check edge CDN / reverse proxy headers
  const cfCountry = headers.get('cf-ipcountry');
  const vercelCountry = headers.get('x-vercel-ip-country');
  const customCountry = headers.get('x-country-code');

  const headerCountry = (cfCountry || vercelCountry || customCountry || '').trim().toUpperCase();
  if (headerCountry && headerCountry.length === 2 && headerCountry !== 'XX' && headerCountry !== 'T1') {
    return NextResponse.json(
      {
        country: headerCountry,
        source: 'header',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  }

  // 2. Check client IP address
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  let clientIp = '';

  if (forwardedFor) {
    clientIp = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    clientIp = realIp.trim();
  }

  // 3. Fallback / external check via country.is
  try {
    const isPrivate =
      !clientIp ||
      clientIp === '127.0.0.1' ||
      clientIp === '::1' ||
      clientIp.startsWith('192.168.') ||
      clientIp.startsWith('10.') ||
      clientIp.startsWith('172.16.') ||
      clientIp.startsWith('172.17.') ||
      clientIp.startsWith('172.18.') ||
      clientIp.startsWith('172.19.') ||
      clientIp.startsWith('172.20.') ||
      clientIp.startsWith('172.21.') ||
      clientIp.startsWith('172.22.') ||
      clientIp.startsWith('172.23.') ||
      clientIp.startsWith('172.24.') ||
      clientIp.startsWith('172.25.') ||
      clientIp.startsWith('172.26.') ||
      clientIp.startsWith('172.27.') ||
      clientIp.startsWith('172.28.') ||
      clientIp.startsWith('172.29.') ||
      clientIp.startsWith('172.30.') ||
      clientIp.startsWith('172.31.');

    const targetUrl = isPrivate ? 'https://api.country.is/' : `https://api.country.is/${clientIp}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const geoRes = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'RangeBulkSMS-GeoLookup/1.0' },
    });
    clearTimeout(timeoutId);

    if (geoRes.ok) {
      const data = await geoRes.json();
      if (data?.country && typeof data.country === 'string' && data.country.length === 2) {
        return NextResponse.json(
          {
            country: data.country.toUpperCase(),
            ip: data.ip || clientIp,
            source: 'ip_lookup',
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          }
        );
      }
    }
  } catch {
    // Timeout or network unreachable
  }

  // 4. Default fallback: UG (Uganda)
  return NextResponse.json({
    country: 'UG',
    source: 'default',
  });
}
