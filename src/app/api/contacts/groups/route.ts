import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { successResponse, errorResponse } from '@/lib/api';
import { contactGroupSchema } from '@/lib/validations/contacts';

export async function GET(_req: NextRequest) {
  try {
    const session = await requirePermission('contacts.view');

    const groups = await prisma.contactGroup.findMany({
      where: { userId: session.userId },
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formatted = groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      color: g.color,
      memberCount: g.memberCount,
      contactCount: g._count?.members ?? g.memberCount ?? 0,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    }));

    return successResponse(formatted);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission('contacts.manage');
    const body = await req.json();
    const data = contactGroupSchema.parse(body);

    const existing = await prisma.contactGroup.findUnique({
      where: {
        userId_name: {
          userId: session.userId,
          name: data.name
        }
      }
    });

    if (existing) {
      return errorResponse(new Error('Contact group with this name already exists.'), 400);
    }

    const group = await prisma.contactGroup.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        user: { connect: { id: session.userId } }
      }
    });

    return successResponse(
      { ...group, contactCount: 0 },
      'Contact group created successfully',
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
