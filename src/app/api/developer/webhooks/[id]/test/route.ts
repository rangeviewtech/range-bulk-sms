import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';
import { WebhookDispatcher } from '@/lib/queue/handlers/webhook-dispatcher';
import { AppError } from '@/lib/errors';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const webhook = await prisma.webhook.findUnique({
      where: { id },
    });

    if (!webhook || webhook.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Webhook not found' }, { status: 404 });
    }

    // Directly invoke WebhookDispatcher with test payload
    const testJob = {
      id: `test_${Date.now()}`,
      payload: {
        webhookId: webhook.id,
        event: 'API_EVENT' as const,
        data: {
          test: true,
          message: 'This is a test ping event from Range Bulk SMS',
          timestamp: new Date().toISOString(),
          webhookId: webhook.id,
        },
      },
    };

    await WebhookDispatcher.handle(testJob);

    // Fetch the latest delivery created by dispatcher
    const delivery = await prisma.webhookDelivery.findFirst({
      where: { webhookId: webhook.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Test ping dispatched',
      delivery: delivery ? {
        statusCode: delivery.statusCode,
        response: delivery.response,
        deliveredAt: delivery.deliveredAt,
        failedAt: delivery.failedAt,
      } : null,
    });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Failed to dispatch test webhook';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
