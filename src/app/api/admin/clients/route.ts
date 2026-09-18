import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'clients.view') || await hasPermission(session.userId, 'clients.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
  if (!session || !(await hasPermission(session.userId, 'clients.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, password, companyName, industry, agentId, initialBalance = 0 } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

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
