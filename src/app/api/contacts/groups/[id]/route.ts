import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { successResponse, errorResponse } from '@/lib/api';
import { contactGroupSchema } from '@/lib/validations/contacts';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('contacts.view');
    const { id } = await context.params;

    const group = await prisma.contactGroup.findUnique({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        _count: {
          select: {
            members: true,
            campaigns: true,
          },
        },
        members: {
          take: 50,
          orderBy: { addedAt: 'desc' },
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                countryCode: true,
                optedOut: true,
                blacklisted: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return errorResponse(new Error('Contact group not found.'), 404);
    }

    const formatted = {
      id: group.id,
      name: group.name,
      description: group.description,
      color: group.color,
      memberCount: group._count.members,
      contactCount: group._count.members,
      campaignCount: group._count.campaigns,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      contacts: group.members.map((m) => ({
        id: m.contact.id,
        name: [m.contact.firstName, m.contact.lastName].filter(Boolean).join(' ') || 'Unnamed Contact',
        firstName: m.contact.firstName,
        lastName: m.contact.lastName,
        phone: m.contact.phone,
        email: m.contact.email,
        status: m.contact.blacklisted ? 'BLACKLISTED' : m.contact.optedOut ? 'OPTED_OUT' : 'ACTIVE',
        addedAt: m.addedAt,
      })),
    };

    return successResponse(formatted);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('contacts.manage');
    const { id } = await context.params;
    const body = await req.json();

    const updateSchema = contactGroupSchema.partial();
    const data = updateSchema.parse(body);

    const existing = await prisma.contactGroup.findUnique({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!existing) {
      return errorResponse(new Error('Contact group not found.'), 404);
    }

    // If renaming, ensure new name is unique for this user
    if (data.name && data.name !== existing.name) {
      const duplicate = await prisma.contactGroup.findUnique({
        where: {
          userId_name: {
            userId: session.userId,
            name: data.name,
          },
        },
      });

      if (duplicate && duplicate.id !== id) {
        return errorResponse(new Error('Another contact group with this name already exists.'), 400);
      }
    }

    const updated = await prisma.contactGroup.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return successResponse(
      {
        ...updated,
        contactCount: updated._count.members,
      },
      'Contact group updated successfully'
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('contacts.manage');
    const { id } = await context.params;

    const existing = await prisma.contactGroup.findUnique({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existing) {
      return errorResponse(new Error('Contact group not found.'), 404);
    }

    await prisma.contactGroup.delete({
      where: { id },
    });

    return successResponse({ id }, 'Contact group deleted successfully');
  } catch (error) {
    return errorResponse(error);
  }
}
