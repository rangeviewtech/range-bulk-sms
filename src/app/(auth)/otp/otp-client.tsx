'use client';

import { UnifiedVerification } from '@/components/forms/unified-verification';

export default function OtpClient({ userId, defaultChannel }: { userId: string; defaultChannel: string }) {
  return <UnifiedVerification userId={userId} defaultChannel={defaultChannel} />;
}
