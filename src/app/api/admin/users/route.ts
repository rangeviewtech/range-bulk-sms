import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { hashPassword } from '@/lib/auth/password';
import { logAudit } from '@/lib/security/audit';


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

const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .optional(),
  roleName: z.enum(['USER', 'ADMIN', 'AGENT', 'CLIENT', 'MANAGER', 'VIEWER']).default('USER'),
  phone: z.string().trim().optional(),
});

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session || !(await hasPermission(session.userId, 'users.manage'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = createUserSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid user creation payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, roleName, phone } = parsed.data;
    const initialPassword = parsed.data.password || `Tmp_${crypto.randomBytes(9).toString('base64url')}!9`;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const role = await prisma.role.findFirst({ where: { name: roleName.toUpperCase() } });
    const passwordHash = await hashPassword(initialPassword);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
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
        phone: true,
        status: true,
        createdAt: true,
        roles: { include: { role: true } }
      }
    });

    await logAudit({
      action: 'ADMIN_ACTION',
      userId: session.userId,
      category: 'SECURITY',
      operation: 'CREATE',
      resourceType: 'User',
      resourceId: user.id,
      metadata: { email: user.email, name: user.name, role: roleName },
    });

    return NextResponse.json({
      success: true,
      user,
      temporaryPassword: parsed.data.password ? undefined : initialPassword,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

