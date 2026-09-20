import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

export async function POST(request: Request) {
  await destroySession();
  const res = NextResponse.redirect(new URL('/login', request.url), { status: 303 });
  res.cookies.delete('session');
  res.cookies.delete('screen_locked');
  res.cookies.set('session', '', { maxAge: 0, path: '/' });
  res.cookies.set('screen_locked', '', { maxAge: 0, path: '/' });
  return res;
}

export async function GET(request: Request) {
  await destroySession();
  const res = NextResponse.redirect(new URL('/login', request.url), { status: 303 });
  res.cookies.delete('session');
  res.cookies.delete('screen_locked');
  res.cookies.set('session', '', { maxAge: 0, path: '/' });
  res.cookies.set('screen_locked', '', { maxAge: 0, path: '/' });
  return res;
}
