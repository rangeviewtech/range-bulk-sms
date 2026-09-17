import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (!session) {
    redirect('/login');
  }

  const isAdmin = session.user.roles?.some((ur) => ur.role?.name === 'ADMIN');
  if (!isAdmin) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
