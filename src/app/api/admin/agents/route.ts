import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { createAgentSchema } from '@/lib/validations/admin';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [canView, canManage] = await Promise.all([
    hasPermission(session.userId, 'agents.view'),
    hasPermission(session.userId, 'agents.manage'),
  ]);
  if (!canView && !canManage) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await hasPermission(session.userId, 'agents.manage'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = createAgentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { name, email, password, companyName, commissionRate, bankName, bankAccount, mobileMoney } = parsed.data;

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

const updateAgentStatusSchema = z.object({
  agentId: z.string().min(1, 'Agent ID is required'),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']),
});

export async function PATCH(req: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await hasPermission(session.userId, 'agents.manage'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = updateAgentStatusSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid agent status payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { agentId, status } = parsed.data;

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { id: true, userId: true, user: { select: { email: true } } },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: agent.userId },
      data: { status },
    });

    return NextResponse.json({ success: true, agentId, status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update agent status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

