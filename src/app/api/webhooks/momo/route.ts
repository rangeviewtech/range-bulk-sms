import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { MtnMomoService, isMtnMomoConfigured } from '@/lib/payments/mtn-momo';

/**
 * MTN callbacks are treated only as a signal to query MTN's authenticated status
 * endpoint. The callback body itself can never mark a wallet payment successful.
 */
export async function POST(request: NextRequest) {
  if (!isMtnMomoConfigured()) return NextResponse.json({ error: 'Payment callbacks are unavailable' }, { status: 503 });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimit = await checkRateLimit('api', `momo-callback:${ip}`);
  if (!rateLimit.success) return NextResponse.json({ error: 'Too many callback requests' }, { status: 429 });

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > 16_384) return NextResponse.json({ error: 'Callback payload too large' }, { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({ error: 'Invalid callback payload' }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > 16_384) {
      await reader.cancel();
      return NextResponse.json({ error: 'Callback payload too large' }, { status: 413 });
    }
    chunks.push(value);
  }
  const payload = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    payload.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const raw = new TextDecoder().decode(payload);
  let externalId: unknown;
  try {
    externalId = (JSON.parse(raw) as { externalId?: unknown }).externalId;
  } catch {
    return NextResponse.json({ error: 'Invalid callback payload' }, { status: 400 });
  }
  if (typeof externalId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(externalId)) {
    return NextResponse.json({ error: 'Invalid callback reference' }, { status: 400 });
  }

  const payment = await prisma.momoPayment.findUnique({ where: { id: externalId }, select: { id: true, userId: true } });
  if (!payment) return new NextResponse(null, { status: 204 });
  try {
    await MtnMomoService.checkStatus(payment.id, payment.userId);
    return new NextResponse(null, { status: 204 });
  } catch {
    // MTN's documented callback delivery is one-shot; users can also refresh and
    // poll the authenticated status endpoint if a transient verification fails.
    return NextResponse.json({ error: 'Unable to verify payment status yet' }, { status: 503 });
  }
}

// MTN's callback setup guidance requires partner listeners to allow both PUT
// and POST. Process either method through the same verification and settlement
// path so callbacks remain untrusted signals until MTN status is re-checked.
export async function PUT(request: NextRequest) {
  return POST(request);
}
