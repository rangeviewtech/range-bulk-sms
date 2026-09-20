import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission, hasPermission } from '@/lib/auth/authorization';
import { requireAuth } from '@/lib/dal';
import { AppError } from '@/lib/errors';
import { successResponse, errorResponse } from '@/lib/api';
import { smsTemplateSchema } from '@/lib/validations/sms';

export async function GET(_req: NextRequest) {
  try {
    const session = await requirePermission('sms.view');
    
    const templates = await prisma.smsTemplate.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(templates);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const canSend = await hasPermission(session.userId, 'sms.send');
    const canCreate = await hasPermission(session.userId, 'campaigns.create');
    
    if (!canSend && !canCreate) {
      throw new AppError('Forbidden: Insufficient permissions', 403, 'FORBIDDEN');
    }

    const body = await req.json();
    const data = smsTemplateSchema.parse(body);

    const existing = await prisma.smsTemplate.findUnique({
      where: {
        userId_name: {
          userId: session.userId,
          name: data.name
        }
      }
    });

    if (existing) {
      return errorResponse(new Error('Template with this name already exists.'), 400);
    }

    const template = await prisma.smsTemplate.create({
      data: {
        name: data.name,
        category: data.category,
        message: data.message,
        variables: data.variables,
        isFavorite: data.isFavorite,
        isShared: data.isShared,
        user: { connect: { id: session.userId } }
      }
    });

    return successResponse(template, 'Template created successfully', 201);
  } catch (error) {
    return errorResponse(error);
  }
}
