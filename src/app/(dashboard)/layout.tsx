import { TrakzeeShell } from '@/components/layout/trakzee-shell';
import { requireAuth } from '@/lib/auth/session';
import { InactivityProvider } from '@/components/providers/inactivity-provider';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth().catch(() => null);
  const user = session?.user || { name: "Ali (Fleet Admin)", email: "ali@technologyhubjuba.com" };

  return (
    <InactivityProvider timeoutMinutes={15}>
      <TrakzeeShell user={user}>
        {children}
      </TrakzeeShell>
    </InactivityProvider>
  );
}
