import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OtpService } from '@/lib/auth/otp';
import { verifyMfaToken } from '@/lib/auth/mfa';
import { getEffectiveMfaRequirement } from '@/lib/auth/mfa-policy';
import { checkRateLimit } from '@/lib/security/rate-limit';
import {
  consumeMobileMfaChallenge,
  getChallengeMethod,
  getMobileMfaChallenge,
  issueMobileSession,
  recordMobileMfaFailure,
} from '@/lib/auth/mobile-mfa';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body.challengeId !== 'string' || typeof body.challengeToken !== 'string' || typeof body.code !== 'string') {
      return NextResponse.json({ success: false, error: 'Enter the verification code to continue.' }, { status: 400 });
    }
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';
    const limit = await checkRateLimit('auth', `mobile-mfa:${ip}:${body.challengeId}`);
    if (!limit.success) {
      return NextResponse.json({ success: false, error: 'Too many attempts. Please sign in again later.' }, { status: 429 });
    }

    const challenge = await getMobileMfaChallenge(body.challengeId, body.challengeToken);
    if (!challenge?.userId) {
      return NextResponse.json({ success: false, error: 'This verification request expired. Please sign in again.' }, { status: 401 });
    }
    const method = getChallengeMethod(challenge.identifier);
    const requirement = await getEffectiveMfaRequirement(challenge.userId);
    if (!method || method === 'WEBAUTHN' || !requirement.required || !requirement.allowedMethods.includes(method)) {
      return NextResponse.json({ success: false, error: 'This verification method is no longer available. Please sign in again.' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: challenge.userId } });
    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: 'Account unavailable. Please sign in again.' }, { status: 401 });
    }

    const code = body.code.trim();
    let valid = false;
    if (method === 'APP') {
      valid = /^\d{6}$/.test(code) && Boolean(user.mfaSecret) && await verifyMfaToken(code, user.mfaSecret || '');
    } else if (/^\d{6}$/.test(code)) {
      const identifier = method === 'EMAIL' ? user.email
        : method === 'TELEGRAM' ? user.telegramChatId
        : user.phone;
      const channelAllowed = method !== 'WHATSAPP' || user.whatsappConsent;
      if (identifier && channelAllowed) {
        const result = await OtpService.verifyOtp(identifier, `MOBILE_MFA:${challenge.id}`, code, user.id);
        valid = result.valid;
      }
    }

    if (!valid) {
      await recordMobileMfaFailure(challenge.id);
      return NextResponse.json({ success: false, error: 'That code is invalid or expired. Check it and try again.' }, { status: 401 });
    }
    if (!(await consumeMobileMfaChallenge(challenge.id))) {
      return NextResponse.json({ success: false, error: 'This verification request has already been used. Please sign in again.' }, { status: 401 });
    }

    const session = await issueMobileSession(user.id, req, body.deviceName);
    return NextResponse.json({ success: true, status: 'AUTHENTICATED', ...session });
  } catch (error) {
    console.error('[MobileAuth] MFA verification failed', error);
    return NextResponse.json({ success: false, error: 'Unable to verify your code right now. Please try again.' }, { status: 500 });
  }
}
