import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { createClientSchema } from '@/lib/validations/admin';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [canView, canManage] = await Promise.all([
    hasPermission(session.userId, 'clients.view'),
    hasPermission(session.userId, 'clients.manage'),
  ]);
  if (!canView && !canManage) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';

  const clients = await prisma.client.findMany({
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
      wallet: true,
      agent: {
        select: { id: true, companyName: true, user: { select: { name: true } } }
      },
      _count: {
        select: { campaigns: true, senderIds: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ clients });
}

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await hasPermission(session.userId, 'clients.manage'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = createClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { name, email, password, companyName, industry, agentId, initialBalance } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const clientRole = await prisma.role.findFirst({ where: { name: 'CLIENT' } });
    const passwordHash = await bcrypt.hash(password || 'Password123!', 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
          roles: clientRole ? {
            create: { roleId: clientRole.id }
          } : undefined
        }
      });

      const client = await tx.client.create({
        data: {
          userId: user.id,
          companyName: companyName || name,
          industry,
          agentId: agentId || null,
        }
      });

      const wallet = await tx.wallet.create({
        data: {
          userId: user.id,
          clientId: client.id,
          balance: Number(initialBalance) || 0,
          currency: 'UGX',
          smsCredits: Math.floor((Number(initialBalance) || 0) / 50),
        }
      });

      return { user, client, wallet };
    });

    return NextResponse.json({ success: true, client: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create client';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const updateClientStatusSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']),
});

export async function PATCH(req: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await hasPermission(session.userId, 'clients.manage'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = updateClientStatusSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid client status payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { clientId, status } = parsed.data;

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, userId: true, user: { select: { email: true } } },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: client.userId },
      data: { status },
    });

    return NextResponse.json({ success: true, clientId, status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update client status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

