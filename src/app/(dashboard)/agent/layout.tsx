import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (!session) {
    redirect('/login');
  }

  const isPrivilegedRole = session.user.roles?.some(
    (ur) => ur.role?.name === 'ADMIN' || ur.role?.name === 'AGENT'
  );

  if (isPrivilegedRole) {
    return <>{children}</>;
  }

  const agent = await prisma.agent.findUnique({
    where: { userId: session.userId },
    select: { id: true, status: true },
  });

  if (!agent) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
