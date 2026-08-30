import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { jwtVerify } from 'jose';

// Define routing paths
const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
const protectedPrefixes = ['/dashboard', '/settings', '/profile', '/admin'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;
  
  let hasSession = false;
  let mfaVerified = true;

  if (sessionCookie) {
    try {
      const secret = process.env.AUTH_SECRET || '';
      const key = new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(sessionCookie, key);
      hasSession = true;
      if (payload.mfaVerified === false) {
        mfaVerified = false;
      }
    } catch (e) {
      hasSession = false;
    }
  }

  // If trying to access public auth paths while logged in
  if (publicPaths.includes(pathname) && hasSession) {
    if (!mfaVerified) {
      return NextResponse.redirect(new URL('/2fa/challenge', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Handle MFA Challenge Routing
  if (hasSession && !mfaVerified && pathname !== '/2fa/challenge') {
    return NextResponse.redirect(new URL('/2fa/challenge', request.url));
  }

  if (hasSession && mfaVerified && pathname === '/2fa/challenge') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const isProtectedPath = protectedPrefixes.some(prefix => pathname.startsWith(prefix));
  
  if (isProtectedPath) {
    if (!hasSession) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const screenLocked = request.cookies.get('screen_locked')?.value === 'true';
    if (screenLocked && pathname !== '/screen-lock') {
      return NextResponse.redirect(new URL('/screen-lock', request.url));
    }
  }

  if (pathname === '/screen-lock') {
    const screenLocked = request.cookies.get('screen_locked')?.value === 'true';
    if (!hasSession || !screenLocked) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
