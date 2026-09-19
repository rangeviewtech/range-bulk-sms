'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth, encrypt, decrypt, createSession, destroySession } from '@/lib/auth/session';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { generateMfaSecret, verifyMfaToken } from '@/lib/auth/mfa';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { revokeUserDevice, revokeAllOtherDevices as revokeOtherDevicesHelper } from '@/lib/auth/device';
import { logAudit } from '@/lib/security/audit';

function result(status: string): never {
  redirect('/settings/security?status=' + status);
}

async function authorize(form: FormData) {
  const session = await requireAuth();
  if (!(await checkRateLimit('auth', 'security-settings:' + session.userId)).success)
    result('limited');
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
  const password = form.get('password');
  if (
    typeof password !== 'string' ||
    !user.passwordHash ||
    !(await verifyPassword(password, user.passwordHash))
  )
    result('invalid');
  return user;
}

export async function beginMfaSetup(form: FormData) {
  const user = await authorize(form);
  if (user.mfaEnabled) result('enabled');
  const expiresAt = new Date(Date.now() + 10 * 60_000);
  const pending = await encrypt({ userId: user.id, secret: generateMfaSecret(), expiresAt });
  (await cookies()).set('mfa_setup', pending, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/settings/security',
    expires: expiresAt,
  });
  result('setup');
}

export async function enableMfa(form: FormData) {
  const session = await requireAuth();
  if (!(await checkRateLimit('auth', 'security-settings:' + session.userId)).success)
    result('limited');
  const store = await cookies();
  const value = store.get('mfa_setup')?.value;
  const pending = value ? await decrypt(value) : null;
  const token = form.get('token');
  if (
    !pending ||
    pending.userId !== session.userId ||
    typeof pending.secret !== 'string' ||
    typeof pending.expiresAt !== 'string' ||
    Date.parse(pending.expiresAt) <= Date.now()
  )
    result('expired');
  if (typeof token !== 'string' || !(await verifyMfaToken(token, pending.secret)))
    result('invalid');
  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.userId },
      data: { mfaEnabled: true, mfaSecret: pending.secret },
    }),
    prisma.session.deleteMany({ where: { userId: session.userId } }),
  ]);
  store.delete('mfa_setup');
  await createSession(session.userId, true);
  result('enabled');
}

export async function disableMfa(form: FormData) {
  const user = await authorize(form);

  // Check if MFA is mandatory for this user's role
  const { getEffectiveMfaRequirement } = await import('@/lib/auth/mfa-policy');
  const policy = await getEffectiveMfaRequirement(user.id);
  if (policy.type === 'MANDATORY_ROLE') {
    result('mfa-mandatory');
  }

  const token = form.get('token');
  if (
    !user.mfaSecret ||
    typeof token !== 'string' ||
    !(await verifyMfaToken(token, user.mfaSecret))
  )
    result('invalid');
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: false, mfaSecret: null },
    }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);
  await createSession(user.id, true);
  result('disabled');
}

export async function savePin(form: FormData) {
  const user = await authorize(form);
  const pin = form.get('pin');
  if (typeof pin !== 'string' || !/^\d{6}$/.test(pin)) result('pin-invalid');
  await prisma.user.update({
    where: { id: user.id },
    data: { screenLockPin: await hashPassword(pin) },
  });
  result('pin-saved');
}

export async function revokeSession(form: FormData) {
  const session = await requireAuth();
  const sessionId = form.get('sessionId');
  if (typeof sessionId !== 'string') result('invalid');

  const cookieStore = await cookies();
  const currentCookie = cookieStore.get('session')?.value;
  const currentPayload = currentCookie ? await decrypt(currentCookie) : null;
  const isCurrentSession = currentPayload?.sessionId === sessionId;

  await prisma.session.deleteMany({
    where: { id: sessionId, userId: session.userId },
  });

  await logAudit({
    userId: session.userId,
    action: 'SESSION_REVOKED',
    resourceType: 'Session',
    resourceId: sessionId,
    category: 'SECURITY',
  });

  if (isCurrentSession) {
    await destroySession();
    redirect('/login');
  }

  result('session-revoked');
}

export async function revokeAllOtherSessions() {
  const session = await requireAuth();
  const cookieStore = await cookies();
  const currentCookie = cookieStore.get('session')?.value;
  const currentPayload = currentCookie ? await decrypt(currentCookie) : null;
  const currentSessionId =
    typeof currentPayload?.sessionId === 'string' ? currentPayload.sessionId : undefined;

  await prisma.session.deleteMany({
    where: {
      userId: session.userId,
      ...(currentSessionId ? { id: { not: currentSessionId } } : {}),
    },
  });

  await logAudit({
    userId: session.userId,
    action: 'SESSION_REVOKED',
    resourceType: 'Session',
    category: 'SECURITY',
    metadata: { allOther: true },
  });

  result('sessions-cleared');
}

export async function revokeDevice(form: FormData) {
  const session = await requireAuth();
  const deviceId = form.get('deviceId');
  if (typeof deviceId !== 'string') result('invalid');

  await revokeUserDevice(session.userId, deviceId);
  result('device-revoked');
}

export async function revokeAllOtherDevices() {
  const session = await requireAuth();
  await revokeOtherDevicesHelper(session.userId);
  result('devices-cleared');
}
