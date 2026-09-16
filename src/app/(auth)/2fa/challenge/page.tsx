import { redirect } from 'next/navigation';
import { AuthLayout } from '@/components/layout/auth-layout';
import {
  UnifiedVerification,
  type VerificationMethod,
} from '@/components/forms/unified-verification';
import { verifySession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export default async function TwoFactorChallengePage() {
  const session = await verifySession();
  if (!session) redirect('/login');
  if (session.mfaVerified) redirect(session.screenLocked ? '/screen-lock' : '/dashboard');
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { mfaEnabled: true, telegramChatId: true, phone: true, whatsappConsent: true },
  });
  const channel = user.mfaEnabled
    ? 'APP'
    : user.telegramChatId
      ? 'TELEGRAM'
      : user.phone
        ? user.whatsappConsent
          ? 'WHATSAPP'
          : 'SMS'
        : 'EMAIL';
  const methods: VerificationMethod[] = user.mfaEnabled
    ? ['APP']
    : [
        'EMAIL',
        ...(user.phone ? ['SMS' as const] : []),
        ...(user.phone && user.whatsappConsent ? ['WHATSAPP' as const] : []),
        ...(user.telegramChatId ? ['TELEGRAM' as const] : []),
      ];
  return (
    <AuthLayout>
      <UnifiedVerification
        userId={session.userId}
        defaultChannel={channel}
        allowedMethods={methods}
      />
    </AuthLayout>
  );
}
