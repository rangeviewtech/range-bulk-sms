import { verifySession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { AgentDashboard } from '../dashboard/components/agent-dashboard';

export default async function AgentRootPage() {
  const session = await verifySession();
  if (!session) redirect('/login');

  const userRole = session.user.roles?.[0]?.role?.name || 'CLIENT';
  if (userRole !== 'AGENT') {
    redirect(userRole === 'ADMIN' ? '/admin' : '/client');
  }

  return <AgentDashboard />;
}
