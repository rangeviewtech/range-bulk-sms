import { z } from 'zod';
import { recoverStuckJobs } from '@/lib/jobs/db';
import { prisma } from '@/lib/prisma';
import { JobStatus } from '@/generated/prisma';
import { SmtpProvider } from '@/lib/providers/smtp';
import { PandoraSmsProvider } from '@/lib/providers/pandora';
import { TelegramProvider } from '@/lib/providers/telegram';
import { WhatsAppProvider } from '@/lib/providers/whatsapp';
import { InAppProvider } from '@/lib/providers/in-app';

export async function processJobsBatch(batchSize: number = 10) {
  await recoverStuckJobs();
  const workerId = crypto.randomUUID();
  const limit = Math.min(100, Math.max(1, Math.trunc(batchSize)));
  // Use PRISMA internal $queryRaw with FOR UPDATE SKIP LOCKED
  // This is Postgres-specific!
  const jobs = await prisma.$queryRaw<import('@/generated/prisma').Job[]>`
    UPDATE "Job"
    SET status = 'PROCESSING', "lockedAt" = NOW(), "lockedBy" = ${workerId}, "startedAt" = NOW(),
        "updatedAt" = NOW()
    WHERE id IN (
      SELECT id
      FROM "Job"
      WHERE status IN ('PENDING', 'RETRYING')
        AND "lockedAt" IS NULL
        AND ("availableAt" IS NULL OR "availableAt" <= NOW())
      ORDER BY
        CASE priority
          WHEN 'CRITICAL' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'NORMAL' THEN 3
          WHEN 'LOW' THEN 4
          ELSE 5
        END ASC,
        "createdAt" ASC
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *;
  `;

  if (jobs.length === 0) return 0;

  for (const job of jobs) {
    // Renew the entire remaining batch while processing it serially.
    await prisma.job.updateMany({
      where: { lockedBy: workerId, status: 'PROCESSING' },
      data: { lockedAt: new Date() },
    });
    const lease = await prisma.job.updateMany({
      where: { id: job.id, lockedBy: workerId, status: 'PROCESSING' },
      data: { lockedAt: new Date() },
    });
    if (lease.count === 0) continue;

    let status: JobStatus = 'SUCCEEDED';
    let lastError = null;

    try {
      const payload = z
        .object({
          recipient: z.string().min(1),
          template: z.string().min(1),
          templateData: z.record(z.unknown()).optional(),
          category: z.string().optional(),
          messageId: z.string().optional(),
          recipientId: z.string().optional(),
        })
        .parse(job.payload);
      const { recipient, template, templateData } = payload;

      let channelStr: 'EMAIL' | 'SMS' | 'TELEGRAM' | 'WHATSAPP' | 'IN_APP' = 'EMAIL';
      if (job.type === 'send-sms') channelStr = 'SMS';
      if (job.type === 'send-telegram') channelStr = 'TELEGRAM';
      if (job.type === 'send-whatsapp') channelStr = 'WHATSAPP';
      if (job.type === 'send-in-app') channelStr = 'IN_APP';

      const { NotificationTemplateService } = await import('@/lib/notifications/templates');
      const resolved = await NotificationTemplateService.resolveTemplate(
        template,
        channelStr,
        templateData || {}
      );

      switch (job.type) {
        case 'send-email': {
          // Pre-dispatch token check for password recovery
          if (template === 'auth.password_reset') {
            const rawToken = String(templateData?.token || '');
            if (rawToken) {
              const crypto = await import('crypto');
              const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
              const validToken = await prisma.verificationToken.findFirst({
                where: {
                  token: { in: [tokenHash, rawToken] },
                  identifier: recipient,
                  type: 'PASSWORD_RESET',
                  expiresAt: { gt: new Date() },
                },
              });

              if (!validToken) {
                // Token has expired or was already consumed
                status = 'CANCELLED';
                const { logger } = await import('@/lib/logger');
                await logger.audit({
                  eventName: 'EMAIL_DISPATCH_CANCELLED_EXPIRED_TOKEN',
                  category: 'SECURITY',
                  severity: 'WARN',
                  outcome: 'SUCCESS',
                  action: 'READ',
                  description: `Password reset email cancelled: token already expired or consumed for ${recipient}`,
                  metadata: { jobId: job.id, recipient },
                });
                break;
              }
            }
          }

          await SmtpProvider.send(recipient, resolved.subject || 'Notification', resolved.body);
          break;
        }
        case 'send-sms': {
          const smsResult = await PandoraSmsProvider.send(recipient, resolved.body);
          if (payload.recipientId) {
            await prisma.messageRecipient.updateMany({
              where: { id: payload.recipientId },
              data: {
                status: 'SENT',
                providerMsgId: smsResult?.messageId ? String(smsResult.messageId) : undefined,
                sentAt: new Date(),
              },
            });
          }
          break;
        }
        case 'send-telegram':
          await TelegramProvider.send(recipient, resolved.body);
          break;
        case 'send-whatsapp':
          await WhatsAppProvider.send(recipient, template, templateData);
          break;
        case 'send-in-app':
          await InAppProvider.send(
            recipient, // which is userId
            payload.category || 'default',
            resolved.subject || 'Notification',
            resolved.body
          );
          break;
        default:
          throw new Error(`Unsupported job type: ${job.type}`);
      }
    } catch (e: unknown) {
      lastError = e instanceof Error ? e.message : String(e);
      status = job.attempts >= job.maxAttempts - 1 ? 'DEAD_LETTER' : 'RETRYING';

      // Mark recipient as failed if job reached dead letter
      try {
        const p = job.payload as Record<string, unknown>;
        if (status === 'DEAD_LETTER' && typeof p?.recipientId === 'string') {
          await prisma.messageRecipient.updateMany({
            where: { id: p.recipientId },
            data: {
              status: 'FAILED',
              failedAt: new Date(),
              failureReason: lastError,
            },
          });
        }
      } catch {
        // Ignore recipient update errors in dead letter catch block
      }
    }

    await prisma.job.updateMany({
      where: { id: job.id, lockedBy: workerId, status: 'PROCESSING' },
      data: {
        status,
        lastError,
        lockedAt: null,
        lockedBy: null,
        attempts: { increment: 1 },
        // Exponential backoff for retries: 5s, 25s, 125s, etc
        availableAt:
          status === 'RETRYING'
            ? new Date(Date.now() + Math.min(3_600_000, Math.pow(5, job.attempts + 1) * 1000))
            : job.availableAt,
        completedAt: status === 'SUCCEEDED' || status === 'CANCELLED' ? new Date() : null,
        failedAt: status === 'DEAD_LETTER' ? new Date() : null,
      },
    });
  }

  return jobs.length;
}
