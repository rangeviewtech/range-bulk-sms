import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getEffectiveMfaRequirement } from '@/lib/auth/mfa-policy';
import { createMobileMfaChallenge, issueMobileSession, sendMobileOtp } from '@/lib/auth/mobile-mfa';
import type { VerificationMethod } from '@/lib/auth/mfa-policy';

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

    const mfaRequirement = await getEffectiveMfaRequirement(user.id);
    const mobileMethods: Exclude<VerificationMethod, 'WEBAUTHN'>[] = mfaRequirement.allowedMethods.filter(
      (method): method is Exclude<VerificationMethod, 'WEBAUTHN'> => method !== 'WEBAUTHN'
    );
    if (mfaRequirement.required) {
      if (mobileMethods.length === 0) {
        return NextResponse.json(
          { success: false, code: 'MFA_METHOD_UNAVAILABLE', error: 'Complete passkey verification in the web app or configure an authenticator method supported on mobile.' },
          { status: 403 }
        );
      }

      const selectedMethod: Exclude<VerificationMethod, 'WEBAUTHN'> = mobileMethods.includes(
        mfaRequirement.defaultMethod as Exclude<VerificationMethod, 'WEBAUTHN'>
      )
        ? mfaRequirement.defaultMethod as Exclude<VerificationMethod, 'WEBAUTHN'>
        : mobileMethods[0]!;
      const challenge = await createMobileMfaChallenge(user.id, selectedMethod);
      if (selectedMethod !== 'APP') {
        await sendMobileOtp(user.id, selectedMethod, challenge.id);
      }

      return NextResponse.json({
        success: true,
        status: 'MFA_REQUIRED',
        challengeId: challenge.id,
        challengeToken: challenge.token,
        method: selectedMethod,
        allowedMethods: mobileMethods,
        maskedContact: mfaRequirement.maskedContact,
        expiresAt: challenge.expiresAt.toISOString(),
      });
    }

    const result = await issueMobileSession(user.id, req, body.deviceName);
    return NextResponse.json({ success: true, status: 'AUTHENTICATED', ...result });
  } catch (error: unknown) {
    console.error('[MobileAuth] Login failed', error);
    return NextResponse.json({ success: false, error: 'Unable to sign in right now. Please try again.' }, { status: 500 });
  }
}
