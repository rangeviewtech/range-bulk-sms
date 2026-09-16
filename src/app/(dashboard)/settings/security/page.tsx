import { cookies } from 'next/headers';
import Image from 'next/image';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requireAuth, decrypt } from '@/lib/auth/session';
import { generateMfaQrCode } from '@/lib/auth/mfa';
import { prisma } from '@/lib/prisma';
import {
  beginMfaSetup,
  enableMfa,
  disableMfa,
  savePin,
} from '@/app/(dashboard)/settings/security/actions';

const messages: Record<string, string> = {
  setup: 'Scan the QR code and enter a code from your authenticator to finish setup.',
  enabled: 'Authenticator verification is enabled.',
  disabled: 'Authenticator verification is disabled.',
  invalid: 'The password or verification code is incorrect.',
  expired: 'Setup expired. Please start again.',
  limited: 'Too many attempts. Please try again later.',
  'pin-invalid': 'Enter a six-digit PIN.',
  'pin-saved': 'Your screen-lock PIN was saved.',
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
  const value = (await cookies()).get('mfa_setup')?.value;
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
    <div className="space-y-6 p-6">
      <PageHeader
        heading="Security Settings"
        description="Manage authenticator verification and your screen-lock PIN."
      />
      {status && messages[status] && (
        <p role="status" className="border-border bg-muted rounded-md border p-3 text-sm">
          {messages[status]}
        </p>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Multi-Factor Authentication (MFA)</CardTitle>
            <CardDescription>
              {user.mfaEnabled
                ? 'Enabled — codes are required at sign-in.'
                : 'Disabled — add an authenticator app to protect your account.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qrCode ? (
              <form action={enableMfa} className="space-y-4">
                <Image
                  src={qrCode}
                  width={200}
                  height={200}
                  alt="Scan this setup QR code with your authenticator app"
                  unoptimized
                />
                <Label htmlFor="setup-token">Authenticator code</Label>
                <Input
                  id="setup-token"
                  name="token"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  autoComplete="one-time-code"
                  required
                />
                <Button type="submit">Enable authenticator</Button>
              </form>
            ) : (
              <form action={user.mfaEnabled ? disableMfa : beginMfaSetup} className="space-y-4">
                <Label htmlFor="mfa-password">Current password</Label>
                <Input
                  id="mfa-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
                {user.mfaEnabled && (
                  <>
                    <Label htmlFor="disable-token">Authenticator code</Label>
                    <Input
                      id="disable-token"
                      name="token"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      autoComplete="one-time-code"
                      required
                    />
                  </>
                )}
                <Button type="submit" variant={user.mfaEnabled ? 'destructive' : 'default'}>
                  {user.mfaEnabled ? 'Disable authenticator' : 'Set up authenticator'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Screen Lock PIN</CardTitle>
            <CardDescription>
              {user.screenLockPin
                ? 'A PIN is configured. Enter your password to change it.'
                : 'Without a PIN, inactivity signs you out. Set a PIN to unlock without signing in again.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={savePin} className="space-y-4">
              <Label htmlFor="pin-password">Current password</Label>
              <Input
                id="pin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
              <Label htmlFor="new-pin">New six-digit PIN</Label>
              <Input
                id="new-pin"
                name="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                autoComplete="new-password"
                required
              />
              <Button type="submit">Save PIN</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
