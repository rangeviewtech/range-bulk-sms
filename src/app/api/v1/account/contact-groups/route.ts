import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { AppError } from '@/lib/errors';
import { contactGroupSchema } from '@/lib/validations/contacts';

export async function GET() {
  try {
    const session = await requirePermission('contacts.view');
    const groups = await prisma.contactGroup.findMany({
      where: { userId: session.userId },
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      groups: groups.map((group) => ({
        id: group.id,
        name: group.name,
        contactCount: group._count.members,
      })),
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: 'Unable to load contact groups.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('contacts.manage');
    const parsed = contactGroupSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid group.' }, { status: 400 });
    }

    const group = await prisma.contactGroup.create({
      data: {
        name: parsed.data.name ?? '',
        user: { connect: { id: session.userId } },
        ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
        ...(parsed.data.color !== undefined ? { color: parsed.data.color } : {}),
      },
      select: { id: true, name: true },
    });
    return NextResponse.json({ success: true, group }, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'A group with this name already exists.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Unable to create contact group.' }, { status: 500 });
  }
}
