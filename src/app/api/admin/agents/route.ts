import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'agents.view') || await hasPermission(session.userId, 'agents.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';

  const agents = await prisma.agent.findMany({
    where: search ? {
      OR: [
        { companyName: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    } : undefined,
    include: {
      user: {
        select: { id: true, name: true, email: true, status: true, createdAt: true }
      },
      clients: {
        select: { id: true, companyName: true }
      },
      _count: {
        select: { clients: true, commissions: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ agents });
}

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'agents.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, password, companyName, commissionRate = 5.0, bankName, bankAccount, mobileMoney } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const agentRole = await prisma.role.findFirst({ where: { name: 'AGENT' } });
    const passwordHash = await bcrypt.hash(password || 'Password123!', 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
          roles: agentRole ? {
            create: { roleId: agentRole.id }
          } : undefined
        }
      });

      const agent = await tx.agent.create({
        data: {
          userId: user.id,
          companyName: companyName || name,
          commissionRate: Number(commissionRate) || 5.0,
          bankName,
          bankAccount,
          mobileMoney,
        }
      });

      const wallet = await tx.wallet.create({
        data: {
          userId: user.id,
          agentId: agent.id,
          balance: 0,
          currency: 'UGX',
        }
      });

      return { user, agent, wallet };
    });

    return NextResponse.json({ success: true, agent: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create agent';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
