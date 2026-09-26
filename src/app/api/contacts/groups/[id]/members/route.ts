import { NextRequest } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api';
import { z } from 'zod';

const addMembersSchema = z.object({
  contactIds: z.array(z.string().uuid()).min(1, 'Select at least one contact to add'),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('contacts.view');
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search')?.trim() || '';

    // Verify group belongs to user
    const group = await prisma.contactGroup.findFirst({
      where: { id, userId: session.userId },
      select: { id: true, name: true },
    });

    if (!group) {
      return errorResponse(new Error('Contact group not found.'), 404);
    }

    const skip = (page - 1) * limit;

    const where: Prisma.ContactGroupMemberWhereInput = {
      contactGroupId: id,
      contact: {
        userId: session.userId,
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' as const } },
                { lastName: { contains: search, mode: 'insensitive' as const } },
                { phone: { contains: search } },
                { email: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
    };

    const [members, total] = await Promise.all([
      prisma.contactGroupMember.findMany({
        where,
        skip,
        take: limit,
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
      }),
      prisma.contactGroupMember.count({ where }),
    ]);

    const formatted = members.map((m) => ({
      id: m.contact.id,
      name: [m.contact.firstName, m.contact.lastName].filter(Boolean).join(' ') || 'Unnamed Contact',
      firstName: m.contact.firstName,
      lastName: m.contact.lastName,
      phone: m.contact.phone,
      email: m.contact.email,
      status: m.contact.blacklisted ? 'BLACKLISTED' : m.contact.optedOut ? 'OPTED_OUT' : 'ACTIVE',
      addedAt: m.addedAt,
    }));

    return paginatedResponse(formatted, total, page, limit);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('contacts.manage');
    const { id } = await context.params;
    const body = await req.json();
    const data = addMembersSchema.parse(body);

    const group = await prisma.contactGroup.findFirst({
      where: { id, userId: session.userId },
    });

    if (!group) {
      return errorResponse(new Error('Contact group not found.'), 404);
    }

    // Verify all contacts belong to user
    const validContacts = await prisma.contact.findMany({
      where: {
        id: { in: data.contactIds },
        userId: session.userId,
        deletedAt: null,
      },
      select: { id: true },
    });

    const validIds = validContacts.map((c) => c.id);
    if (validIds.length === 0) {
      return errorResponse(new Error('No valid contacts found to add.'), 400);
    }

    // Add members safely (skip duplicates via createMany with skipDuplicates)
    await prisma.contactGroupMember.createMany({
      data: validIds.map((contactId) => ({
        contactId,
        contactGroupId: id,
      })),
      skipDuplicates: true,
    });

    // Update group member count
    const totalMembers = await prisma.contactGroupMember.count({
      where: { contactGroupId: id },
    });

    await prisma.contactGroup.update({
      where: { id },
      data: { memberCount: totalMembers },
    });

    return successResponse(
      { addedCount: validIds.length, totalMembers },
      `Added ${validIds.length} contact(s) to group.`
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('contacts.manage');
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get('contactId');

    if (!contactId) {
      return errorResponse(new Error('contactId parameter is required.'), 400);
    }

    const group = await prisma.contactGroup.findFirst({
      where: { id, userId: session.userId },
    });

    if (!group) {
      return errorResponse(new Error('Contact group not found.'), 404);
    }

    await prisma.contactGroupMember.deleteMany({
      where: {
        contactGroupId: id,
        contactId,
      },
    });

    // Update group member count
    const totalMembers = await prisma.contactGroupMember.count({
      where: { contactGroupId: id },
    });

    await prisma.contactGroup.update({
      where: { id },
      data: { memberCount: totalMembers },
    });

    return successResponse(
      { removedContactId: contactId, totalMembers },
      'Contact removed from group.'
    );
  } catch (error) {
    return errorResponse(error);
  }
}
