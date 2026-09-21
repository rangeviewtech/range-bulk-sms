import { cookies } from 'next/headers';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { requireAuth } from '@/lib/dal';
import { decrypt } from '@/lib/auth/session';
import { generateMfaQrCode } from '@/lib/auth/mfa';
import { getEffectiveMfaRequirement } from '@/lib/auth/mfa-policy';
import { prisma } from '@/lib/prisma';
import {
  beginMfaSetup,
  enableMfa,
  disableMfa,
  savePin,
  revokeSession,
  revokeAllOtherSessions,
  revokeDevice,
  revokeAllOtherDevices,
} from '@/app/(dashboard)/settings/security/actions';
import { MfaSetupForm, MfaActionForm, ScreenLockPinForm } from '@/components/forms/security-forms';
import { ShieldCheck, Smartphone, Laptop, AlertTriangle } from 'lucide-react';

const messages: Record<string, string> = {
  setup: 'Scan the QR code and enter a code from your authenticator to finish setup.',
  enabled: 'Authenticator verification is enabled.',
  disabled: 'Authenticator verification is disabled.',
  invalid: 'The password or verification code is incorrect.',
  expired: 'Setup expired. Please start again.',
  limited: 'Too many attempts. Please try again later.',
  'pin-invalid': 'Enter a six-digit PIN.',
  'pin-saved': 'Your screen-lock PIN was saved.',
  'session-revoked': 'Session was revoked successfully.',
  'sessions-cleared': 'All other active sessions have been signed out.',
  'device-revoked': 'Recognized device was revoked.',
  'devices-cleared': 'All other recognized devices have been revoked.',
  'mfa-mandatory': 'Multi-Factor Authentication is mandatory for your role and cannot be disabled.',
};

export default async function SecuritySettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireAuth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { mfaEnabled: true, screenLockPin: true },
  });

  const mfaPolicy = await getEffectiveMfaRequirement(session.userId);

  const cookieStore = await cookies();
  const currentCookie = cookieStore.get('session')?.value;
  const currentPayload = currentCookie ? await decrypt(currentCookie) : null;
  const currentSessionId =
    typeof currentPayload?.sessionId === 'string' ? currentPayload.sessionId : undefined;

  const [activeSessions, recognizedDevices] = await Promise.all([
    prisma.session.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.userDevice.findMany({
      where: { userId: session.userId, revokedAt: null },
      orderBy: { lastLoginAt: 'desc' },
      take: 10,
    }),
  ]);

  const value = cookieStore.get('mfa_setup')?.value;
  const pending = value ? await decrypt(value) : null;
  const setupSecret =
    !user.mfaEnabled &&
    pending?.userId === session.userId &&
    typeof pending.secret === 'string' &&
    typeof pending.expiresAt === 'string' &&
    Date.parse(pending.expiresAt) > new Date().getTime()
      ? pending.secret
      : null;
  const qrCode = setupSecret ? await generateMfaQrCode(session.user.email, setupSecret) : null;
  const { status } = await searchParams;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        heading="Security & Device Management"
        description="Manage two-factor authentication, screen-lock PIN, active sessions, and recognized devices."
      />

      {status && messages[status] && (
        <div
          role="status"
          className={`rounded-md border p-3 text-sm flex items-center gap-2 ${
            status === 'mfa-mandatory' || status === 'invalid' || status === 'limited'
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-border bg-muted text-foreground'
          }`}
        >
          {status === 'mfa-mandatory' && <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{messages[status]}</span>
        </div>
      )}

      {mfaPolicy.type === 'MANDATORY_ROLE' && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Mandatory Multi-Factor Authentication Enforced
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Because your account has the privileged role{' '}
              <strong>{mfaPolicy.roles.join(', ')}</strong>, secondary verification is strictly
              required on every sign-in. Recognized devices cannot bypass this requirement.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* MFA Setup Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Multi-Factor Authentication (MFA)</CardTitle>
              {user.mfaEnabled ? (
                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline">Not Enrolled</Badge>
              )}
            </div>
            <CardDescription>
              {user.mfaEnabled
                ? 'Time-based one-time password (TOTP) is active for your account.'
                : 'Protect your account using an authenticator app (Google Authenticator, Authy, etc.).'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qrCode ? (
              <MfaSetupForm qrCode={qrCode} action={enableMfa} />
            ) : (
              <MfaActionForm
                mfaEnabled={user.mfaEnabled}
                isMandatoryRole={mfaPolicy.type === 'MANDATORY_ROLE'}
                action={user.mfaEnabled ? disableMfa : beginMfaSetup}
              />
            )}
          </CardContent>
        </Card>

        {/* Screen Lock PIN Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Screen Lock PIN</CardTitle>
              {user.screenLockPin ? (
                <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                  Configured
                </Badge>
              ) : (
                <Badge variant="outline">Not Set</Badge>
              )}
            </div>
            <CardDescription>
              {user.screenLockPin
                ? 'Quick unlock PIN is set. Inactivity locks your screen without terminating session.'
                : 'Without a PIN, inactivity will log you out. Set a 6-digit PIN to lock and resume quickly.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScreenLockPinForm action={savePin} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Sessions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Active Sessions</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Current active sign-in sessions for your account.
              </CardDescription>
            </div>
            {activeSessions.length > 1 && (
              <form action={revokeAllOtherSessions}>
                <Button type="submit" variant="outline" size="sm" className="text-xs">
                  Sign Out Other Sessions
                </Button>
              </form>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {activeSessions.map((s) => {
              const isCurrent = s.id === currentSessionId;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Laptop className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {s.deviceInfo ? s.deviceInfo.slice(0, 40) : 'Web Session'}
                        </span>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground text-[11px] mt-0.5">
                        IP: {s.ipAddress || '127.0.0.1'} • Started{' '}
                        {new Date(s.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <form action={revokeSession}>
                    <input type="hidden" name="sessionId" value={s.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:bg-destructive/10"
                    >
                      {isCurrent ? 'Sign Out' : 'Revoke'}
                    </Button>
                  </form>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recognized Devices Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Recognized Devices</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Devices remembered for seamless sign-in security.
              </CardDescription>
            </div>
            {recognizedDevices.length > 0 && (
              <form action={revokeAllOtherDevices}>
                <Button type="submit" variant="outline" size="sm" className="text-xs">
                  Revoke All Devices
                </Button>
              </form>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {recognizedDevices.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3">
                No recognized devices saved yet.
              </p>
            ) : (
              recognizedDevices.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">
                        {d.deviceName || 'Recognized Device'}
                      </div>
                      <div className="text-muted-foreground text-[11px] mt-0.5">
                        IP: {d.ipAddress || '127.0.0.1'} • Last active{' '}
                        {new Date(d.lastLoginAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <form action={revokeDevice}>
                    <input type="hidden" name="deviceId" value={d.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:bg-destructive/10"
                    >
                      Revoke
                    </Button>
                  </form>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
