
 
 
import { TrakzeeShell } from '@/components/layout/trakzee-shell';
import { verifySession } from '@/lib/auth/session';
import { InactivityProvider } from '@/components/providers/inactivity-provider';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (!session) redirect('/login');
  if (!session.mfaVerified) redirect('/2fa/challenge');
  if (session.screenLocked) redirect('/screen-lock');
  const user = { name: session.user.name, email: session.user.email };

  return (
    <InactivityProvider timeoutMinutes={15}>
      <TrakzeeShell user={user}>
        {children}
      </TrakzeeShell>
    </InactivityProvider>
  );
}
