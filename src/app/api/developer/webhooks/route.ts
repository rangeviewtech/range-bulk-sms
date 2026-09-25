import { NextRequest, NextResponse } from 'next/server';
import { prisma, WebhookEvent } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';
import crypto from 'crypto';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { validateSsrfUrl } from '@/lib/security/ssrf-filter';

const createWebhookSchema = z.object({
  url: z.string().url('A valid HTTPS or HTTP URL is required'),
  description: z.string().max(255).optional(),
  events: z.array(z.nativeEnum(WebhookEvent)).min(1, 'Select at least one event'),
});

export async function GET() {
  try {
    const session = await requireAuth();

    const webhooks = await prisma.webhook.findMany({
      where: { userId: session.userId },
      include: {
        _count: {
          select: { deliveries: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: webhooks });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json().catch(() => ({}));

    const parsed = createWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { url, description, events } = parsed.data;

    // Validate URL against SSRF (blocks localhost, 169.254.x, RFC1918 private IPs, etc.)
    const ssrfCheck = await validateSsrfUrl(url);
    if (!ssrfCheck.isSafe) {
      return NextResponse.json(
        { success: false, error: `Invalid webhook destination: ${ssrfCheck.reason}` },
        { status: 400 }
      );
    }

    // Generate cryptographic HMAC secret for webhook payload signing
    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;

    const webhook = await prisma.webhook.create({
      data: {
        userId: session.userId,
        url,
        secret,
        events,
        description,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: webhook }, { status: 201 });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
