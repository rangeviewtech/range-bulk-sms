import { createMetadata } from '@/lib/metadata';
import { verifySession } from '@/lib/auth/session';
import { resolveDashboardDestination } from '@/lib/auth/destination';
import { redirect } from 'next/navigation';

export const metadata = createMetadata({
  title: 'Login',
});

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (session?.isAuth) {
    if (session.mfaVerified) {
      redirect(resolveDashboardDestination(session.user?.roles));
    } else {
      redirect('/2fa/challenge');
    }
  }

  return <>{children}</>;
}
