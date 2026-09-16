import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { jwtVerify } from 'jose';
import { checkRateLimit } from '@/lib/security/rate-limit';

// Define routing paths
const protectedPrefixes = [
  '/dashboard',
  '/settings',
  '/profile',
  '/admin',
  '/notifications',
  '/examples',
  '/sms',
  '/contacts',
  '/campaigns',
  '/wallet',
  '/agent',
  '/developer',
  '/sender-ids',
  '/support'
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  // 1. Extract IP for Rate Limiting
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : request.headers.get('x-real-ip') || '127.0.0.1';

  // 2. Rate Limit Application Routes (API specifically)
  if (
    pathname.startsWith('/api/') &&
    !['/api/health', '/api/cron/process-jobs', '/api/webhooks/telegram'].includes(pathname)
  ) {
    const isAuth = pathname.startsWith('/api/auth');
    const limitResult = await checkRateLimit(isAuth ? 'auth' : 'api', ip);

    if (!limitResult.success) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limitResult.limit.toString(),
          'X-RateLimit-Remaining': limitResult.remaining.toString(),
          'X-RateLimit-Reset': limitResult.reset.toString(),
        },
      });
    }
  }

  // 1. CSRF Protection for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return new NextResponse(
            JSON.stringify({
              success: false,
              error: { code: 'FORBIDDEN', message: 'CSRF violation' },
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } catch {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Invalid origin' },
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  let hasSession = false;
  let mfaVerified = false;
  let signedScreenLocked = false;

  if (sessionCookie) {
    try {
      const secret = process.env.AUTH_SECRET || '';
      if (secret.length < 32) throw new Error('Invalid session configuration');
      const key = new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(sessionCookie, key, { algorithms: ['HS256'] });
      hasSession =
        typeof payload.sessionId === 'string' &&
        typeof payload.userId === 'string' &&
        typeof payload.expiresAt === 'string' &&
        Date.parse(payload.expiresAt) > Date.now();
      mfaVerified = payload.mfaVerified === true;
      signedScreenLocked = payload.screenLocked === true;
    } catch (_e) {
      hasSession = false;
    }
  }

  const isProtectedPath = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );

  if (isProtectedPath) {
    if (!hasSession) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (!mfaVerified) return NextResponse.redirect(new URL('/2fa/challenge', request.url));

    const screenLocked =
      signedScreenLocked || request.cookies.get('screen_locked')?.value === 'true';
    if (hasSession && screenLocked && pathname !== '/screen-lock') {
      return NextResponse.redirect(new URL('/screen-lock', request.url));
    }
  }

  if (pathname === '/screen-lock') {
    const screenLocked =
      signedScreenLocked || request.cookies.get('screen_locked')?.value === 'true';
    if (!hasSession || !screenLocked) {
      return NextResponse.redirect(new URL(hasSession ? '/dashboard' : '/login', request.url));
    }
  }

  const requestId = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('x-request-id', requestId);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
