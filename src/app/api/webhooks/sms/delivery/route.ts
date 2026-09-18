import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { MessageStatus } from '@/generated/prisma';

const deliveryReceiptSchema = z.object({
  messageId: z.string().optional(),
  recipientId: z.string().optional(),
  providerMsgId: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['DELIVERED', 'FAILED', 'UNDELIVERED', 'REJECTED', 'PENDING']),
  failureReason: z.string().optional(),
  deliveredAt: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.SMS_DELIVERY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CRITICAL: SMS_DELIVERY_WEBHOOK_SECRET is unconfigured in server environment');
      return NextResponse.json({ error: 'Webhook authentication unconfigured' }, { status: 500 });
    }

    const providedSecret =
      req.headers.get('x-delivery-secret') ||
      req.headers.get('x-sms-webhook-secret') ||
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (!providedSecret) {
      return NextResponse.json({ error: 'Unauthorized: Missing webhook secret' }, { status: 401 });
    }

    const expectedBuffer = Buffer.from(webhookSecret);
    const actualBuffer = Buffer.from(providedSecret);

    if (
      expectedBuffer.length !== actualBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
    ) {
      return NextResponse.json({ error: 'Unauthorized: Invalid webhook secret' }, { status: 401 });
    }


    const rawBody = await req.json().catch(() => ({}));
    const parsed = deliveryReceiptSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid delivery receipt payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { recipientId, providerMsgId, messageId, phone, status, failureReason, deliveredAt } = parsed.data;

    let mappedStatus: MessageStatus = 'PENDING';
    if (status === 'DELIVERED') mappedStatus = 'DELIVERED';
    else if (['FAILED', 'UNDELIVERED', 'REJECTED'].includes(status)) mappedStatus = 'FAILED';

    // Locate the recipient record
    const recipient = await prisma.messageRecipient.findFirst({
      where: {
        OR: [
          ...(recipientId ? [{ id: recipientId }] : []),
          ...(providerMsgId ? [{ providerMsgId }] : []),
          ...(messageId && phone ? [{ messageId, phone }] : []),
        ],
      },
    });

    if (!recipient) {
      return NextResponse.json({ success: true, message: 'Recipient not found, acknowledged' });
    }

    await prisma.messageRecipient.update({
      where: { id: recipient.id },
      data: {
        status: mappedStatus,
        deliveredAt: mappedStatus === 'DELIVERED' ? (deliveredAt ? new Date(deliveredAt) : new Date()) : null,
        failedAt: mappedStatus === 'FAILED' ? new Date() : null,
        failureReason: failureReason || null,
        providerMsgId: providerMsgId || recipient.providerMsgId,
      },
    });

    // Check parent message completion status
    const remainingPending = await prisma.messageRecipient.count({
      where: {
        messageId: recipient.messageId,
        status: 'PENDING',
      },
    });

    if (remainingPending === 0) {
      const successfulCount = await prisma.messageRecipient.count({
        where: { messageId: recipient.messageId, status: 'DELIVERED' },
      });

      await prisma.message.update({
        where: { id: recipient.messageId },
        data: {
          status: successfulCount > 0 ? 'DELIVERED' : 'FAILED',
          deliveredAt: successfulCount > 0 ? new Date() : null,
          failedAt: successfulCount === 0 ? new Date() : null,
        },
      });
    }

    return NextResponse.json({ success: true, recipientId: recipient.id, status: mappedStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
