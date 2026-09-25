import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { jwtVerify } from 'jose';
import { checkRateLimit } from '@/lib/security/rate-limit';

import { resolveDashboardDestination } from '@/lib/auth/destination';

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

const guestRoutes = [
  '/login',
  '/register',
  '/forgot-password',
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
    const isAuth = pathname.startsWith('/api/auth') && pathname !== '/api/auth/session';
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

  // 3. CSRF Protection for state-changing requests
  // Exempt machine-to-machine, signature, or token authenticated endpoints (webhooks, public APIs, cron)
  const isCsrfExempt =
    pathname.startsWith('/api/webhooks/') ||
    pathname.startsWith('/api/v1/') ||
    pathname.startsWith('/api/cron/');

  if (!isCsrfExempt && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

    const sourceHeader = origin || referer;
    if (sourceHeader && host) {
      try {
        const sourceUrl = new URL(sourceHeader);
        if (sourceUrl.host !== host) {
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
            error: { code: 'FORBIDDEN', message: 'Invalid origin header' },
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  let hasSession = false;
  let mfaVerified = false;
  let signedScreenLocked = false;
  let sessionRoles: string[] = [];
  let isIdleExpired = false;

  if (sessionCookie) {
    try {
      const secret = process.env.AUTH_SECRET || '';
      if (secret.length < 32) throw new Error('Invalid session configuration');
      const key = new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(sessionCookie, key, { algorithms: ['HS256'] });

      const isAbsoluteValid =
        typeof payload.sessionId === 'string' &&
        typeof payload.userId === 'string' &&
        typeof payload.expiresAt === 'string' &&
        Date.parse(payload.expiresAt) > Date.now();

      // Check 15-minute idle expiration for non-remembered sessions
      if (
        isAbsoluteValid &&
        payload.rememberMe === false &&
        typeof payload.idleExpiresAt === 'string' &&
        Date.parse(payload.idleExpiresAt) <= Date.now()
      ) {
        isIdleExpired = true;
      }

      if (isAbsoluteValid && !isIdleExpired) {
        hasSession = true;
        mfaVerified = payload.mfaVerified === true;
        signedScreenLocked = payload.screenLocked === true;
        if (Array.isArray(payload.roles)) {
          sessionRoles = payload.roles as string[];
        }
      }
    } catch (_e) {
      hasSession = false;
    }
  }

  // If session expired due to idle timeout on a protected or active path, redirect with deletion
  if (isIdleExpired) {
    const expiredRedirect = NextResponse.redirect(new URL('/login?expired=1', request.url));
    expiredRedirect.cookies.delete('session');
    expiredRedirect.cookies.delete('screen_locked');
    return expiredRedirect;
  }

  // 4. Guest Route Guards (redirect authenticated users away from login/register/etc.)
  const isGuestRoute =
    guestRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    (pathname === '/reset-password' && !request.nextUrl.searchParams.get('token'));

  if (isGuestRoute) {
    if (hasSession && mfaVerified) {
      const callbackUrl =
        request.nextUrl.searchParams.get('callbackUrl') ||
        request.nextUrl.searchParams.get('returnTo');
      const destination = resolveDashboardDestination(sessionRoles, callbackUrl);
      return NextResponse.redirect(new URL(destination, request.url));
    }

    if (hasSession && !mfaVerified) {
      return NextResponse.redirect(new URL('/2fa/challenge', request.url));
    }
  }

  // 5. 2FA Challenge Route Guard
  if (pathname === '/2fa/challenge' || pathname.startsWith('/2fa/challenge/')) {
    if (hasSession && mfaVerified) {
      const destination = resolveDashboardDestination(sessionRoles);
      return NextResponse.redirect(new URL(destination, request.url));
    }
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 6. Protected Routes Guard
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

  // 6.1 Admin Routes Guard (Edge Defense-in-Depth)
  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin');
  if (isAdminPath) {
    if (!hasSession) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (!sessionRoles.includes('ADMIN')) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (pathname === '/screen-lock') {
    const screenLocked =
      signedScreenLocked || request.cookies.get('screen_locked')?.value === 'true';
    if (!hasSession || !screenLocked) {
      const destination = hasSession
        ? resolveDashboardDestination(sessionRoles)
        : '/login';
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  const requestId = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('x-request-id', requestId);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, manifest.webmanifest, sw.js
     * - static image formats (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
