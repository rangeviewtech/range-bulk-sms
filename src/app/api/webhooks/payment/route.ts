import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { Prisma } from '@/lib/prisma';
import { WalletService } from '@/lib/wallet/service';
import { logAudit } from '@/lib/security/audit';

const paymentWebhookSchema = z.object({
  event: z.enum(['payment.success', 'payment.failed']),
  reference: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('UGX'),
  userId: z.string().optional(),
  walletId: z.string().optional(),
  paymentMethod: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get('x-webhook-signature') ||
      req.headers.get('x-signature') ||
      req.headers.get('x-pay-signature');

    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CRITICAL: PAYMENT_WEBHOOK_SECRET is unconfigured in server environment');
      return NextResponse.json({ error: 'Webhook authentication unconfigured' }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 401 });
    }

    const hmac = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    const expectedBuffer = Buffer.from(hmac);
    const actualBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== actualBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
    ) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }


    const payload = JSON.parse(rawBody);
    const parsed = paymentWebhookSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid webhook payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { event, reference, amount, userId, walletId, paymentMethod } = parsed.data;

    if (event === 'payment.success') {
      let targetWalletId = walletId;
      if (!targetWalletId && userId) {
        const wallet = await WalletService.getOrCreateWallet({ userId });
        targetWalletId = wallet.id;
      }

      if (!targetWalletId) {
        return NextResponse.json({ error: 'Target wallet could not be resolved' }, { status: 400 });
      }

      const depositResult = await WalletService.deposit(
        targetWalletId,
        new Prisma.Decimal(amount),
        {
          userId,
          description: `Payment deposit via ${paymentMethod || 'gateway'} [${reference}]`,
          paymentMethod,
          paymentRef: reference,
          idempotencyKey: `pay-${reference}`,
        }
      );

      await logAudit({
        action: 'ADMIN_ACTION',
        userId: userId || undefined,
        category: 'APPLICATION',
        operation: 'UPDATE',
        resourceType: 'Wallet',
        resourceId: targetWalletId,
        metadata: {
          reference,
          amount,
          transactionRef: depositResult.transactionRef,
        },
      });
    }

    return NextResponse.json({ success: true, reference });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
