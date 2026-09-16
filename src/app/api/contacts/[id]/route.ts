import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { successResponse, errorResponse } from '@/lib/api';
import { updateContactSchema } from '@/lib/validations/contacts';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, props: Params) {
  try {
    const session = await requirePermission('contacts.view');
    const { id } = await props.params;

    const contact = await prisma.contact.findFirst({
      where: { id, userId: session.userId, deletedAt: null },
      include: { groups: true, tags: true }
    });

    if (!contact) return errorResponse(new Error('Contact not found'), 404);

    return successResponse(contact);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest, props: Params) {
  try {
    const session = await requirePermission('contacts.manage');
    const { id } = await props.params;
    const body = await req.json();
    const data = updateContactSchema.parse(body);

    const contact = await prisma.contact.findFirst({
      where: { id, userId: session.userId, deletedAt: null }
    });

    if (!contact) return errorResponse(new Error('Contact not found'), 404);

    let normalizedPhone = contact.normalizedPhone;
    if (data.phone && data.countryCode) {
       normalizedPhone = data.phone;
       if (normalizedPhone.startsWith('0')) {
         normalizedPhone = normalizedPhone.replace(/^0/, data.countryCode);
       } else if (!normalizedPhone.startsWith('+')) {
         normalizedPhone = `${data.countryCode}${normalizedPhone}`;
       }
    }

    const { groupIds, ...rest } = data;
    const restData: any = { ...rest };

    const updated = await prisma.contact.update({
      where: { id },
      data: {
        ...restData,
        normalizedPhone,
        groups: groupIds ? {
          deleteMany: {},
          create: groupIds.map(gId => ({ contactGroupId: gId }))
        } : undefined
      }
    });

    return successResponse(updated, 'Contact updated successfully');
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest, props: Params) {
  try {
    const session = await requirePermission('contacts.manage');
    const { id } = await props.params;
    const contact = await prisma.contact.findFirst({
      where: { id, userId: session.userId, deletedAt: null }
    });

    if (!contact) return errorResponse(new Error('Contact not found'), 404);

    await prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return successResponse(null, 'Contact deleted successfully');
  } catch (error) {
    return errorResponse(error);
  }
}
