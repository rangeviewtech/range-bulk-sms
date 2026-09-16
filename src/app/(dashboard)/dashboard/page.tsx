import { verifySession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { AdminDashboard } from './components/admin-dashboard';
import { ClientDashboard } from './components/client-dashboard';
import { AgentDashboard } from './components/agent-dashboard';

export default async function DashboardPage() {
  const session = await verifySession();
  if (!session) redirect('/login');

  const userRole = session.user.roles?.[0]?.role?.name || 'CLIENT';

  if (userRole === 'ADMIN') {
    return <AdminDashboard />;
  }

  if (userRole === 'AGENT') {
    return <AgentDashboard />;
  }

  return <ClientDashboard />;
}
