import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticatedSession } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { MtnMomoService, isMtnMomoConfigured } from '@/lib/payments/mtn-momo';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ paymentId: string }> },
) {
  const session = await verifyAuthenticatedSession();
  if (!session?.userId) return NextResponse.json({ error: 'Sign in to view this payment' }, { status: 401 });
  if (!isMtnMomoConfigured()) return NextResponse.json({ error: 'MTN Mobile Money top-ups are not available yet' }, { status: 503 });

  const rateLimit = await checkRateLimit('api', `wallet-momo-status:${session.userId}`);
  if (!rateLimit.success) return NextResponse.json({ error: 'Too many status checks. Try again shortly.' }, { status: 429 });

  const { paymentId } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(paymentId)) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  try {
    const payment = await MtnMomoService.checkStatus(paymentId, session.userId);
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    return NextResponse.json({ data: {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount.toString(),
      currency: payment.currency,
    } });
  } catch {
    return NextResponse.json({ error: 'Payment status is temporarily unavailable' }, { status: 502 });
  }
}
