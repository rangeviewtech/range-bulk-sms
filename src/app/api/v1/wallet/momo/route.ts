import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuthenticatedSession } from '@/lib/auth/session';
import { WalletService } from '@/lib/wallet/service';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { MtnMomoService, isMtnMomoConfigured } from '@/lib/payments/mtn-momo';

const requestSchema = z.object({
  amount: z.coerce.number().int().min(1_000).max(100_000_000),
  phone: z.string().trim().min(9).max(20),
});

export async function POST(request: NextRequest) {
  const session = await verifyAuthenticatedSession();
  if (!session?.userId) return NextResponse.json({ error: 'Sign in to top up your wallet' }, { status: 401 });
  if (!isMtnMomoConfigured()) {
    return NextResponse.json({ error: 'MTN Mobile Money top-ups are not available yet' }, { status: 503 });
  }

  const rateLimit = await checkRateLimit('api', `wallet-momo:${session.userId}`);
  if (!rateLimit.success) return NextResponse.json({ error: 'Too many payment requests. Try again shortly.' }, { status: 429 });

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter an amount of at least UGX 1,000 and a valid Uganda mobile number' }, { status: 400 });

  const idempotencyKey = request.headers.get('idempotency-key')?.trim();
  if (idempotencyKey && (idempotencyKey.length > 128 || !/^[\w:.\-]+$/.test(idempotencyKey))) {
    return NextResponse.json({ error: 'Invalid payment request key' }, { status: 400 });
  }

  try {
    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    const payment = await MtnMomoService.initiate({
      userId: session.userId,
      walletId: wallet.id,
      amount: parsed.data.amount,
      phone: parsed.data.phone,
      idempotencyKey,
    });
    return NextResponse.json({
      data: {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount.toString(),
        currency: payment.currency,
      },
    }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message.startsWith('Enter a valid') || message.includes('already used') ? 400 : 502;
    return NextResponse.json({ error: status === 400 ? message : 'Unable to start the MTN payment. Try again shortly.' }, { status });
  }
}
