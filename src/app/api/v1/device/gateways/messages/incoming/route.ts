import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withDeviceAuth, sendGatewayResponse } from '@/lib/gateways/device-auth';
import { JobWorker } from '@/lib/queue/worker';
import { z } from 'zod';

const incomingSmsSchema = z.object({
  from: z.string().trim().min(1).max(64),
  to: z.string().trim().max(64).optional(),
  message: z.string().trim().min(1).max(10_000),
  timestamp: z.string().max(64).optional(),
  simSlot: z.number().int().min(0).max(9).optional(),
});

export const POST = async (req: NextRequest) => {
  return withDeviceAuth(req, async (req, { gatewayId, gatewaySecret, body, isE2EE }) => {
    try {
      const parsed = incomingSmsSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid incoming SMS data' }, { status: 400 });
      }
      const { from, to, message, timestamp, simSlot } = parsed.data;
      
      const gateway = await prisma.gateway.findUnique({ where: { id: gatewayId } });
      if (!gateway) {
        return NextResponse.json({ error: 'Gateway not found' }, { status: 404 });
      }

      // Log incoming SMS
      await prisma.gatewayLog.create({
        data: {
          gatewayId,
          level: 'INFO',
          event: 'INCOMING_SMS',
          // Keep phone numbers and message contents out of operational logs.
          message: 'Incoming SMS received',
        }
      });

      // Find active webhooks for this user that listen to SMS_RECEIVED
      const webhooks = await prisma.webhook.findMany({
        where: {
          userId: gateway.userId,
          isActive: true,
          events: {
            has: 'SMS_RECEIVED'
          }
        }
      });

      const payload = {
        gatewayId,
        from,
        to: to || undefined,
        message,
        timestamp: timestamp && Number.isFinite(Date.parse(timestamp))
          ? new Date(timestamp).toISOString()
          : new Date().toISOString(),
        simSlot,
      };

      // Enqueue webhook dispatch jobs
      for (const webhook of webhooks) {
        await JobWorker.enqueue('webhook.dispatch', {
          webhookId: webhook.id,
          event: 'SMS_RECEIVED',
          data: payload,
        });
      }

      
      return sendGatewayResponse({ success: true, dispatchedWebhooks: webhooks.length }, gatewaySecret, isE2EE);
    } catch (error: unknown) {
      console.error('Gateway Incoming SMS Error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
};


