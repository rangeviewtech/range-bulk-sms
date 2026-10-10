import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { AppError } from '@/lib/errors';
import { createContactSchema } from '@/lib/validations/contacts';
import { normalizePhoneNumber } from '@/lib/sms/normalizer';

const addMemberSchema = createContactSchema.pick({ firstName: true, lastName: true, phone: true, email: true, countryCode: true });

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requirePermission('contacts.view');
    const { id } = await params;
    const group = await prisma.contactGroup.findFirst({ where: { id, userId: session.userId }, select: { id: true } });
    if (!group) return NextResponse.json({ success: false, error: 'Contact group not found.' }, { status: 404 });

    const members = await prisma.contactGroupMember.findMany({
      where: { contactGroupId: id, contact: { userId: session.userId, deletedAt: null } },
      orderBy: { addedAt: 'desc' },
      take: 500,
      select: {
        addedAt: true,
        contact: { select: { id: true, firstName: true, lastName: true, phone: true, normalizedPhone: true } },
      },
    });

    return NextResponse.json({
      success: true,
      members: members.map(({ contact, addedAt }) => ({ ...contact, addedAt: addedAt.toISOString() })),
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: 'Unable to load group members.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requirePermission('contacts.manage');
    const { id } = await params;
    const parsed = addMemberSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid contact.' }, { status: 400 });
    }

    const group = await prisma.contactGroup.findFirst({ where: { id, userId: session.userId }, select: { id: true } });
    if (!group) return NextResponse.json({ success: false, error: 'Contact group not found.' }, { status: 404 });

    const normalized = normalizePhoneNumber(parsed.data.phone, parsed.data.countryCode);
    if (!normalized.isValid) return NextResponse.json({ success: false, error: 'Enter a valid phone number.' }, { status: 400 });

    const contact = await prisma.$transaction(async (tx) => {
      const createdContact = await tx.contact.create({
        data: {
          userId: session.userId,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone,
          normalizedPhone: normalized.normalized,
          email: parsed.data.email || null,
          groups: { create: { contactGroupId: id } },
        },
        select: { id: true },
      });
      await tx.contactGroup.update({ where: { id }, data: { memberCount: { increment: 1 } } });
      return createdContact;
    });
    return NextResponse.json({ success: true, contactId: contact.id }, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'This phone number is already in your contacts.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Unable to add contact to this group.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requirePermission('contacts.manage');
    const { id } = await params;
    const contactId = z.string().uuid().safeParse(new URL(request.url).searchParams.get('contactId'));
    if (!contactId.success) return NextResponse.json({ success: false, error: 'Valid contactId is required.' }, { status: 400 });

    const group = await prisma.contactGroup.findFirst({ where: { id, userId: session.userId }, select: { id: true } });
    if (!group) return NextResponse.json({ success: false, error: 'Contact group not found.' }, { status: 404 });

    await prisma.contactGroupMember.deleteMany({
      where: {
        contactGroupId: id,
        contactId: contactId.data,
        contact: { userId: session.userId },
      },
    });
    const memberCount = await prisma.contactGroupMember.count({ where: { contactGroupId: id } });
    await prisma.contactGroup.update({ where: { id }, data: { memberCount } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: 'Unable to remove contact from this group.' }, { status: 500 });
  }
}
