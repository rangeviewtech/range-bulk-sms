import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { successResponse, paginatedResponse, errorResponse } from '@/lib/api';
import { createContactSchema } from '@/lib/validations/contacts';

export async function GET(req: NextRequest) {
  try {
    const session = await requirePermission('contacts.view');
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const where = {
      userId: session.userId,
      deletedAt: null,
      ...(search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ]
      } : {})
    };

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.contact.count({ where })
    ]);

    return paginatedResponse(contacts, total, page, limit);
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

    const { groupIds, ...rest } = data;
    const restData: any = { ...rest };

    const contact = await prisma.contact.create({
      data: {
        ...restData,
        normalizedPhone,
        userId: session.userId,
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
