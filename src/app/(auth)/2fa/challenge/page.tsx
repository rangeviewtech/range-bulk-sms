import { redirect } from 'next/navigation';
import { AuthLayout } from '@/components/layout/auth-layout';
import { UnifiedVerification } from '@/components/forms/unified-verification';
import { verifySession } from '@/lib/auth/session';
import { getPreauthChallenge } from '@/lib/auth/preauth';
import { getEffectiveMfaRequirement } from '@/lib/auth/mfa-policy';

export default async function TwoFactorChallengePage() {
  const session = await verifySession();
  const preauth = await getPreauthChallenge();

  const userId = session?.userId || preauth?.userId;
  if (!userId) {
    redirect('/login');
  }

  if (session?.mfaVerified) {
    redirect(session.screenLocked ? '/screen-lock' : '/dashboard');
  }

  const mfaPolicy = await getEffectiveMfaRequirement(userId);
  const selectedMethod = preauth?.selectedMethod || mfaPolicy.defaultMethod;

  return (
    <AuthLayout>
      <UnifiedVerification
        userId={userId}
        defaultMethod={selectedMethod}
        allowedMethods={mfaPolicy.allowedMethods}
        maskedContact={mfaPolicy.maskedContact}
      />
    </AuthLayout>
  );
}
