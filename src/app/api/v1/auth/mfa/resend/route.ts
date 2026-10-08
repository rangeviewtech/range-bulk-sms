import { NextRequest, NextResponse } from 'next/server';
import { getEffectiveMfaRequirement } from '@/lib/auth/mfa-policy';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getChallengeMethod, getMobileMfaChallenge, sendMobileOtp } from '@/lib/auth/mobile-mfa';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body.challengeId !== 'string' || typeof body.challengeToken !== 'string') {
      return NextResponse.json({ success: false, error: 'Sign in again to request a new code.' }, { status: 400 });
    }
    const challenge = await getMobileMfaChallenge(body.challengeId, body.challengeToken);
    if (!challenge?.userId) {
      return NextResponse.json({ success: false, error: 'This verification request expired. Please sign in again.' }, { status: 401 });
    }
    const method = getChallengeMethod(challenge.identifier);
    const requirement = await getEffectiveMfaRequirement(challenge.userId);
    if (!method || !['EMAIL', 'SMS', 'WHATSAPP', 'TELEGRAM'].includes(method) || !requirement.allowedMethods.includes(method)) {
      return NextResponse.json({ success: false, error: 'A new code is not available for this verification method.' }, { status: 400 });
    }
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';
    const limit = await checkRateLimit('auth', `mobile-mfa-resend:${ip}:${challenge.userId}`);
    if (!limit.success) {
      return NextResponse.json({ success: false, error: 'Too many code requests. Please try again later.' }, { status: 429 });
    }
    await sendMobileOtp(challenge.userId, method as 'EMAIL' | 'SMS' | 'WHATSAPP' | 'TELEGRAM', challenge.id);
    return NextResponse.json({ success: true, message: 'A new verification code has been sent.' });
  } catch (error) {
    console.error('[MobileAuth] MFA code resend failed', error);
    return NextResponse.json({ success: false, error: 'Unable to send a new code right now. Please try again.' }, { status: 500 });
  }
}
