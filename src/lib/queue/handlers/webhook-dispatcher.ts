import { WebhookEvent } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { safeSsrfFetch } from "@/lib/security/ssrf-filter";

interface WebhookJobPayload {
  webhookId: string;
  event: WebhookEvent;
  data: Record<string, unknown>;
}

export class WebhookDispatcher {
  static async handle(job: { id: string; payload: unknown }) {
    const payload = job.payload as WebhookJobPayload;

    const webhook = await prisma.webhook.findUnique({
      where: { id: payload.webhookId },
    });

    if (!webhook || !webhook.isActive) {
      return; // Webhook deleted or disabled
    }

    // Sign the payload
    const body = JSON.stringify({
      id: job.id,
      event: payload.event,
      created_at: new Date().toISOString(),
      data: payload.data,
    });

    const signature = crypto
      .createHmac("sha256", webhook.secret)
      .update(body)
      .digest("hex");

    let statusCode = 0;
    let responseBody = "";
    let isSuccess = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await safeSsrfFetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-signature": signature,
          "User-Agent": "RangeBulkSms-Webhook/1.0",
        },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      statusCode = response.status;
      isSuccess = response.ok;

      // Try to read a bit of the response for logging
      responseBody = (await response.text()).substring(0, 500);
    } catch (error: unknown) {
      statusCode = 500;
      responseBody = error instanceof Error ? error.message : "Unknown webhook delivery error";
    }

    await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event: payload.event,
        payload: JSON.parse(body),
        statusCode,
        response: responseBody,
        deliveredAt: isSuccess ? new Date() : null,
        failedAt: !isSuccess ? new Date() : null,
        errorMessage: !isSuccess ? responseBody : null,
      },
    });

    if (!isSuccess) {
      throw new Error(`Webhook failed with status ${statusCode}`);
    }
  }
}
