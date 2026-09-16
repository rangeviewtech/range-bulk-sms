import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { AppError } from '@/lib/errors';
import { successResponse, errorResponse } from '@/lib/api';
import { smsTemplateSchema } from '@/lib/validations/sms';

type Params = { params: Promise<{ id: string }> };

async function checkManagePermissions(userId: string) {
  const canSend = await hasPermission(userId, 'sms.send');
  const canCreate = await hasPermission(userId, 'campaigns.create');
  
  if (!canSend && !canCreate) {
    throw new AppError('Forbidden: Insufficient permissions', 403, 'FORBIDDEN');
  }
}

export async function GET(req: NextRequest, props: Params) {
  try {
    const session = await requireAuth();
    const canView = await hasPermission(session.userId, 'sms.view');
    if (!canView) throw new AppError('Forbidden: Insufficient permissions', 403, 'FORBIDDEN');

    const { id } = await props.params;

    const template = await prisma.smsTemplate.findFirst({
      where: { id, userId: session.userId }
    });

    if (!template) return errorResponse(new Error('Template not found'), 404);

    return successResponse(template);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest, props: Params) {
  try {
    const session = await requireAuth();
    await checkManagePermissions(session.userId);

    const { id } = await props.params;
    const body = await req.json();
    const data = smsTemplateSchema.partial().parse(body);

    const template = await prisma.smsTemplate.findFirst({
      where: { id, userId: session.userId }
    });

    if (!template) return errorResponse(new Error('Template not found'), 404);

    const updated = await prisma.smsTemplate.update({
      where: { id },
      data
    });

    return successResponse(updated, 'Template updated successfully');
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest, props: Params) {
  try {
    const session = await requireAuth();
    await checkManagePermissions(session.userId);

    const { id } = await props.params;
    const template = await prisma.smsTemplate.findFirst({
      where: { id, userId: session.userId }
    });

    if (!template) return errorResponse(new Error('Template not found'), 404);

    await prisma.smsTemplate.delete({
      where: { id }
    });

    return successResponse(null, 'Template deleted successfully');
  } catch (error) {
    return errorResponse(error);
  }
}
