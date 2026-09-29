import { verifySession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { ClientDashboard } from '../dashboard/components/client-dashboard';

export default async function ClientRootPage() {
  const session = await verifySession();
  if (!session) redirect('/login');

  const userRole = session.user.roles?.[0]?.role?.name || 'CLIENT';
  if (userRole === 'ADMIN') redirect('/admin');
  if (userRole === 'AGENT') redirect('/agent');

  return <ClientDashboard />;
}
