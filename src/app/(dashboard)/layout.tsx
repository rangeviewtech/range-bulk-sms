import { RangeShell } from '@/components/layout/range-shell';
import { verifySession } from '@/lib/auth/session';
import { SessionIdleTracker } from '@/components/auth/session-idle-tracker';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (!session) redirect('/login');
  if (!session.mfaVerified) redirect('/2fa/challenge');
  if (session.screenLocked) redirect('/screen-lock');
  
  const userRole = session.user.roles?.[0]?.role?.name || 'CLIENT';
  const user = { 
    name: session.user.name, 
    email: session.user.email,
    role: userRole 
  };

  return (
    <SessionIdleTracker
      rememberMe={session.rememberMe}
      idleExpiresAt={session.idleExpiresAt?.toISOString()}
      expiresAt={session.expiresAt.toISOString()}
      timeoutMinutes={15}
      warningMinutes={2}
    >
      <RangeShell user={user}>
        {children}
      </RangeShell>
    </SessionIdleTracker>
  );
}
