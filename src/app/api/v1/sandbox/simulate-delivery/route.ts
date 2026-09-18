import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';

const simulateDeliverySchema = z.object({
  webhookUrl: z.string().url().optional(),
  webhookSecret: z.string().optional(),
  messageId: z.string().default(() => `msg_test_${crypto.randomUUID().slice(0, 12)}`),
  recipientPhone: z.string().default('+256700123456'),
  status: z.enum(['DELIVERED', 'FAILED', 'UNDELIVERED', 'REJECTED']).default('DELIVERED'),
  failureReason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parsed = simulateDeliverySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          type: 'https://docs.rangesms.com/errors/invalid-request',
          title: 'Invalid Request Data',
          status: 400,
          detail: 'Validation failed for webhook simulator payload',
          code: 'invalid_request',
          errors: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { webhookUrl, webhookSecret, messageId, recipientPhone, status, failureReason } = parsed.data;

    const eventPayload = {
      id: `evt_test_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      type: `message.${status.toLowerCase()}`,
      createdAt: new Date().toISOString(),
      data: {
        messageId,
        recipient: recipientPhone,
        status,
        deliveredAt: status === 'DELIVERED' ? new Date().toISOString() : null,
        failedAt: ['FAILED', 'UNDELIVERED', 'REJECTED'].includes(status) ? new Date().toISOString() : null,
        failureReason: failureReason || (status === 'FAILED' ? 'Simulated carrier unreachable' : null),
        simulated: true,
      },
    };

    let dispatchResult: {
      attempted: boolean;
      statusCode?: number;
      durationMs?: number;
      error?: string;
    } = { attempted: false };

    // If destination URL is provided, test dispatch (with SSRF guard against loopback/internal RFC1918)
    if (webhookUrl) {
      const parsedUrl = new URL(webhookUrl);
      const hostname = parsedUrl.hostname.toLowerCase();

      // Guard against internal network SSRF
      const isInternal =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        (hostname.startsWith('172.') &&
          parseInt(hostname.split('.')[1] || '0', 10) >= 16 &&
          parseInt(hostname.split('.')[1] || '0', 10) <= 31);

      if (isInternal) {
        return NextResponse.json(
          {
            type: 'https://docs.rangesms.com/errors/ssrf-prohibited',
            title: 'SSRF Protection Prohibited Target',
            status: 400,
            detail: 'Webhooks cannot be dispatched to loopback or private internal network addresses.',
            code: 'internal_address_prohibited',
          },
          { status: 400 }
        );
      }

      const bodyString = JSON.stringify(eventPayload);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'RangeBulkSMS-WebhookSimulator/1.0',
        'X-Range-Event': eventPayload.type,
        'X-Range-Delivery-Id': eventPayload.id,
      };

      if (webhookSecret) {
        const signature = crypto.createHmac('sha256', webhookSecret).update(bodyString).digest('hex');
        headers['X-Delivery-Secret'] = webhookSecret;
        headers['X-Range-Signature'] = `sha256=${signature}`;
      }

      const startTime = Date.now();
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: bodyString,
          signal: AbortSignal.timeout(5000),
        });
        const durationMs = Date.now() - startTime;
        dispatchResult = {
          attempted: true,
          statusCode: response.status,
          durationMs,
        };
      } catch (err) {
        const durationMs = Date.now() - startTime;
        dispatchResult = {
          attempted: true,
          durationMs,
          error: err instanceof Error ? err.message : 'Failed to connect to destination',
        };
      }
    }

    return NextResponse.json({
      success: true,
      simulatedEvent: eventPayload,
      dispatchResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        type: 'https://docs.rangesms.com/errors/server-error',
        title: 'Simulator Error',
        status: 500,
        detail: message,
        code: 'server_error',
      },
      { status: 500 }
    );
  }
}
