import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt, REMEMBER_ME_DURATION_MS } from '@/lib/auth/session';
import { VerificationMethod } from '@/lib/auth/mfa-policy';

const MOBILE_MFA_PURPOSE = 'MOBILE_MFA_CHALLENGE';
const MOBILE_MFA_TTL_MS = 5 * 60 * 1000;

export async function createMobileMfaChallenge(userId: string, method: Exclude<VerificationMethod, 'WEBAUTHN'>) {
  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + MOBILE_MFA_TTL_MS);
  const record = await prisma.otpRecord.create({
    data: {
      userId,
      identifier: `mobile-mfa:${method}:${crypto.randomUUID()}`,
      codeHash: hash(token),
      channel: 'IN_APP',
      purpose: MOBILE_MFA_PURPOSE,
      expiresAt,
      maxAttempts: 5,
    },
  });
  return { id: record.id, token, expiresAt, method };
}

export async function getMobileMfaChallenge(id: string, token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id) || token.length !== 43) return null;
  const challenge = await prisma.otpRecord.findFirst({
    where: { id, purpose: MOBILE_MFA_PURPOSE, invalidated: false, expiresAt: { gt: new Date() } },
  });
  if (!challenge || !safeEqual(hash(token), challenge.codeHash)) return null;
  if (challenge.attempts >= challenge.maxAttempts) return null;
  return challenge;
}

export async function recordMobileMfaFailure(id: string) {
  return prisma.otpRecord.updateMany({
    where: {
      id,
      purpose: MOBILE_MFA_PURPOSE,
      invalidated: false,
      expiresAt: { gt: new Date() },
      attempts: { lt: 5 },
    },
    data: { attempts: { increment: 1 } },
  });
}

export function getChallengeMethod(identifier: string): VerificationMethod | null {
  const method = identifier.split(':')[1];
  return ['WEBAUTHN', 'APP', 'EMAIL', 'SMS', 'WHATSAPP', 'TELEGRAM'].includes(method)
    ? method as VerificationMethod
    : null;
}

export async function consumeMobileMfaChallenge(id: string) {
  const consumed = await prisma.otpRecord.updateMany({
    where: {
      id,
      purpose: MOBILE_MFA_PURPOSE,
      invalidated: false,
      expiresAt: { gt: new Date() },
      attempts: { lt: 5 },
    },
    data: { invalidated: true },
  });
  return consumed.count === 1;
}

export async function sendMobileOtp(userId: string, method: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'TELEGRAM', challengeId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User unavailable');
  const identifier = method === 'EMAIL' ? user.email
    : method === 'TELEGRAM' ? user.telegramChatId
    : user.phone;
  if (!identifier || (method === 'WHATSAPP' && !user.whatsappConsent)) {
    throw new Error('Configured verification contact unavailable');
  }
  const { OtpService } = await import('@/lib/auth/otp');
  const { NotificationService } = await import('@/lib/communications/service');
  const { otp } = await OtpService.createOtp({
    userId: user.id,
    identifier,
    channel: method,
    purpose: `MOBILE_MFA:${challengeId}`,
  });
  await NotificationService.sendLoginOtp(identifier, otp, method, 'EN');
}

export async function issueMobileSession(userId: string, req: NextRequest, requestedDeviceName?: unknown) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  if (!user || user.status !== 'ACTIVE') throw new Error('User unavailable');

  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = (forwardedFor?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1').slice(0, 45);
  const userAgent = (req.headers.get('user-agent') || 'Range SMS Mobile Client').slice(0, 250);
  const location = req.headers.get('x-vercel-ip-country')
    ? `${req.headers.get('x-vercel-ip-city') || 'Unknown'}, ${req.headers.get('x-vercel-ip-country')}`
    : 'Local/Unknown';
  const headerDeviceName = req.headers.get('x-device-name');
  const deviceNameValue = typeof requestedDeviceName === 'string' ? requestedDeviceName : headerDeviceName;
  let deviceName = deviceNameValue?.slice(0, 100) || 'Unknown Device';
  if (!deviceNameValue) {
    if (userAgent.includes('Android')) deviceName = 'Android Device';
    else if (userAgent.includes('iPhone')) deviceName = 'iPhone';
    else if (userAgent.includes('Windows')) deviceName = 'Windows PC';
    else if (userAgent.includes('Mac')) deviceName = 'Mac';
    else if (userAgent.includes('Linux')) deviceName = 'Linux PC';
  }

  const expiresAt = new Date(Date.now() + REMEMBER_ME_DURATION_MS);
  const roles = user.roles.map((role) => role.role.name);
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
      location,
      deviceName,
    },
  });
  const token = await encrypt({
    sessionId: session.id,
    userId: user.id,
    mfaVerified: true,
    rememberMe: true,
    roles,
    expiresAt: expiresAt.toISOString(),
  }, '30d');
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      timezone: user.timezone,
      roles,
    },
  };
}

function hash(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function safeEqual(left: string, right: string) {
  return left.length === right.length && crypto.timingSafeEqual(Buffer.from(left), Buffer.from(right));
}
