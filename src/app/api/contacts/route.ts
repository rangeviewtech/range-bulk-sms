import { NextRequest } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api';
import { createContactSchema } from '@/lib/validations/contacts';
import { getMasterContacts, getMasterGroupMembers, getMasterPhoneMatches, MasterContact } from '@/lib/contacts/master-directory';

export async function GET(req: NextRequest) {
  try {
    const session = await requirePermission('contacts.view');
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10);
    const returnAll = searchParams.get('all') === 'true';
    const limit = returnAll ? 1000 : Math.min(100, Math.max(1, isNaN(rawLimit) ? 20 : rawLimit));
    const search = searchParams.get('search') || '';
    const groupId = searchParams.get('groupId') || searchParams.get('group');

    // 1. Fetch any database contacts for this user (scoped to group if requested)
    let dbContacts: Array<{
      id: string;
      firstName: string | null;
      lastName: string | null;
      phone: string;
      normalizedPhone: string | null;
      email: string | null;
      optedOut: boolean;
      createdAt: Date;
      groups?: Array<{ contactGroup: { id: string; name: string } }>;
    }> = [];

    try {
      dbContacts = await prisma.contact.findMany({
        where: {
          userId: session.userId,
          deletedAt: null,
          ...(groupId ? { groups: { some: { contactGroup: { id: groupId } } } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        include: {
          groups: {
            include: {
              contactGroup: true,
            },
          },
        },
      });
    } catch {
      // Prisma fallback if table or connection issue
      dbContacts = [];
    }

    // 2. Map database contacts to unified contact items
    const mappedDbContacts: MasterContact[] = dbContacts.map((c) => {
      const gList = (c.groups || []).map((g) => ({
        id: g.contactGroup.id,
        name: g.contactGroup.name,
      }));
      return {
        id: c.id,
        firstName: c.firstName || '',
        lastName: c.lastName || '',
        name: [c.firstName, c.lastName].filter(Boolean).join(' ') || c.phone,
        phone: c.phone,
        normalizedPhone: c.normalizedPhone || c.phone,
        email: c.email || null,
        status: c.optedOut ? 'OPTED_OUT' : 'ACTIVE',
        addedAt: c.createdAt.toISOString().slice(0, 10),
        createdAt: c.createdAt.toISOString(),
        groupId: gList[0]?.id || '',
        groupName: gList[0]?.name || '',
        groups: gList.length > 0 ? gList : [{ id: 'user_created', name: 'General' }],
      };
    });

    // 3. Get master contacts directory (using pre-indexed phone map for O(1) matching)
    const masterPhoneMatches = getMasterPhoneMatches();
    const masterContacts = groupId ? getMasterGroupMembers(groupId) : getMasterContacts();

    // 4. Merge: DB contacts take priority, inheriting all groups from master matches
    const enrichedDbContacts = mappedDbContacts.map((c) => {
      const matches = masterPhoneMatches.get(c.phone);
      if (matches && matches.length > 0) {
        const allGroups = [...c.groups.filter((g) => g.id !== 'user_created')];
        for (const m of matches) {
          for (const g of m.groups) {
            if (!allGroups.some((ag) => ag.id === g.id || ag.name.toLowerCase() === g.name.toLowerCase())) {
              allGroups.push(g);
            }
          }
        }
        return {
          ...c,
          groupId: matches[0].groupId,
          groupName: matches[0].groupName,
          groups: allGroups.length > 0 ? allGroups : matches[0].groups,
        };
      }
      return c;
    });

    const dbPhoneSet = new Set(enrichedDbContacts.map((c) => c.phone));
    const mergedContacts: MasterContact[] = [
      ...enrichedDbContacts,
      ...masterContacts.filter((c) => !dbPhoneSet.has(c.phone)),
    ];

    // 5. Apply filters if present
    let filtered = mergedContacts;

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.phone.includes(s) ||
          (c.email && c.email.toLowerCase().includes(s)) ||
          c.groups.some((g) => g.name.toLowerCase().includes(s))
      );
    }

    if (groupId && groupId !== 'ALL') {
      const gLow = groupId.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.groupId.toLowerCase() === gLow ||
          c.groupName.toLowerCase() === gLow ||
          c.groups.some((g) => g.id.toLowerCase() === gLow || g.name.toLowerCase() === gLow)
      );
    }

    const total = filtered.length;

    if (returnAll) {
      return successResponse(filtered.slice(0, 1000), 'Contacts retrieved successfully');
    }

    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    return paginatedResponse(paginated, total, page, limit);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission('contacts.manage');
    const body = await req.json();
    const data = createContactSchema.parse(body);
    
    let normalizedPhone = data.phone;
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = normalizedPhone.replace(/^0/, data.countryCode);
    } else if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = `${data.countryCode}${normalizedPhone}`;
    }

    const existing = await prisma.contact.findUnique({
      where: {
        userId_normalizedPhone: {
          userId: session.userId,
          normalizedPhone,
        }
      }
    });

    if (existing) {
      return errorResponse(new Error('Contact with this phone number already exists.'), 400);
    }

    const { groupIds, customFields, ...rest } = data;

    if (groupIds && groupIds.length > 0) {
      const userGroups = await prisma.contactGroup.findMany({
        where: { id: { in: groupIds }, userId: session.userId },
        select: { id: true },
      });
      if (userGroups.length !== groupIds.length) {
        return errorResponse(new Error('One or more contact groups do not exist or do not belong to you.'), 400);
      }
    }

    const contact = await prisma.contact.create({
      data: {
        firstName: rest.firstName,
        lastName: rest.lastName,
        phone: rest.phone,
        email: rest.email || undefined,
        countryCode: rest.countryCode,
        normalizedPhone,
        ...(customFields !== undefined && { customFields: customFields as Prisma.InputJsonValue }),
        user: { connect: { id: session.userId } },
        groups: groupIds ? {
          create: groupIds.map(id => ({ contactGroupId: id }))
        } : undefined
      }
    });

    return successResponse(contact, 'Contact created successfully', 201);
  } catch (error) {
    return errorResponse(error);
  }
}
