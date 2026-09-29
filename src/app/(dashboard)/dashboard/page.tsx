import { verifySession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getDefaultRoleDashboard } from '@/lib/auth/destination';

export default async function DashboardPage() {
  const session = await verifySession();
  if (!session) redirect('/login');

  const userRole = session.user.roles?.[0]?.role?.name || 'CLIENT';
  const target = getDefaultRoleDashboard(userRole);
  
  redirect(target);
}
