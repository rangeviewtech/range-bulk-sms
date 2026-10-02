import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { encrypt, REMEMBER_ME_DURATION_MS } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';

    // Rate limit login attempts
    const rl = await checkRateLimit('auth', `mobile:${ip}`);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: 'Too many authentication attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please provide both valid email and password.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        roles: {
          include: { role: true }
        }
      }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Account is suspended or inactive. Please contact support.' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const roles = user.roles.map((r) => r.role.name);
    const expiresAt = new Date(Date.now() + REMEMBER_ME_DURATION_MS); // 30 days for mobile session
    const userAgent = req.headers.get('user-agent')?.substring(0, 250) || 'Range SMS Mobile Client';

    // Create database-backed persistent session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: crypto.randomUUID(),
        expiresAt,
        lastActivityAt: new Date(),
        rememberMe: true,
        mfaVerified: true,
        deviceInfo: userAgent,
        ipAddress: ip,
      }
    });

    // Encrypt mobile JWT
    const token = await encrypt({
      sessionId: session.id,
      userId: user.id,
      mfaVerified: true,
      rememberMe: true,
      roles,
      expiresAt: expiresAt.toISOString(),
    }, '30d');

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        timezone: user.timezone,
        roles,
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
