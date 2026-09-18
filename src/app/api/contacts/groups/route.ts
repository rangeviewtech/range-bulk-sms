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
      orderBy: { name: 'asc' }
    });

    return successResponse(groups);
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
        ...data,
        userId: session.userId
      }
    });

    return successResponse(group, 'Contact group created successfully', 201);
  } catch (error) {
    return errorResponse(error);
  }
}
