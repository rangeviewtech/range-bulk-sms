import { verifySession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '../dashboard/components/admin-dashboard';

export default async function AdminRootPage() {
  const session = await verifySession();
  if (!session) redirect('/login');

  const userRole = session.user.roles?.[0]?.role?.name || 'CLIENT';
  if (userRole !== 'ADMIN') {
    redirect('/dashboard'); // or /client depending on access
  }

  return <AdminDashboard />;
}
