import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withDeviceAuth } from '@/lib/gateways/device-auth';
import { JobWorker } from '@/lib/queue/worker';

export const POST = async (req: NextRequest) => {
  return withDeviceAuth(req, async (req, { gatewayId }) => {
    try {
      const { from, to, message, timestamp, simSlot } = await req.json();

      if (!from || !message) {
        return NextResponse.json({ error: 'Missing required fields (from, message)' }, { status: 400 });
      }
      
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
          message: "Incoming SMS from  (SIM: )",
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
        timestamp: timestamp || new Date().toISOString(),
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

      return NextResponse.json({ success: true, dispatchedWebhooks: webhooks.length });
    } catch (error: unknown) {
      console.error('Gateway Incoming SMS Error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
};


