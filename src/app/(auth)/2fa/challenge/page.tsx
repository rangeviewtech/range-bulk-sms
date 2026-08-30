import { AuthLayout } from '@/components/layout/auth-layout';
import { UnifiedVerification } from '@/components/forms/unified-verification';

export default async function TwoFactorChallengePage(props: {
  searchParams: Promise<{ userId?: string; channel?: string }>;
}) {
  const searchParams = await props.searchParams;
  const userId = searchParams.userId;
  const channel = searchParams.channel || 'APP';

  return (
    <AuthLayout>
      <UnifiedVerification userId={userId} defaultChannel={channel} />
    </AuthLayout>
  );
}
