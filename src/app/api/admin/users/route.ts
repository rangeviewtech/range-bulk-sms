import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';

import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'users.read') || await hasPermission(session.userId, 'users.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q');

  const users = await prisma.user.findMany({
    where: search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    } : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      mfaEnabled: true,
      createdAt: true,
      roles: {
        include: {
          role: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'users.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, password = 'Password123!', roleName = 'USER' } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const role = await prisma.role.findFirst({ where: { name: roleName.toUpperCase() } });
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        roles: role ? {
          create: { roleId: role.id }
        } : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        roles: { include: { role: true } }
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
