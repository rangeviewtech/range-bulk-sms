import { NextRequest, NextResponse } from 'next/server';
import { prisma, WebhookEvent } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';
import { z } from 'zod';
import { AppError } from '@/lib/errors';

const updateWebhookSchema = z.object({
  isActive: z.boolean().optional(),
  description: z.string().max(255).optional(),
  events: z.array(z.nativeEnum(WebhookEvent)).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const parsed = updateWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 400 });
    }

    const existing = await prisma.webhook.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Webhook not found' }, { status: 404 });
    }

    const updated = await prisma.webhook.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const existing = await prisma.webhook.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Webhook not found' }, { status: 404 });
    }

    await prisma.webhook.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Webhook deleted successfully' });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
