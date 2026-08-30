import { claimJobs, completeJob, failJob, recoverStuckJobs, enqueueJob } from './db';
import { SmtpEmailProvider } from '@/lib/communications/email/smtp-provider';
import { PandoraSmsProvider } from '@/lib/communications/sms/pandora-provider';
import { MetaWhatsAppProvider } from '@/lib/communications/whatsapp/provider';
import { BotApiTelegramProvider } from '@/lib/communications/telegram/provider';
import { renderTemplate } from '@/lib/communications/templates';
import { prisma as db } from '@/lib/prisma';
import { JobPriority } from '@/generated/prisma';

const emailProvider = new SmtpEmailProvider();
const smsProvider = new PandoraSmsProvider();
const whatsappProvider = new MetaWhatsAppProvider();
const telegramProvider = new BotApiTelegramProvider();

export async function processJobsBatch(workerId: string = 'worker-1') {
  await recoverStuckJobs();

  // Claim a batch of jobs
  const jobs = await claimJobs(workerId, 20, [
    'email-critical', 'email-default', 'email-bulk', 
    'sms-critical', 'sms-default', 'sms-bulk', 
    'whatsapp-critical', 'whatsapp-default',
    'telegram-critical', 'telegram-default',
    'system'
  ]);
  
  if (jobs.length === 0) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failedCount = 0;

  for (const job of jobs) {
    try {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = job.payload as any;

      if (job.type === 'send-email') {
        const rendered = renderTemplate('EMAIL', payload.template, payload.templateData);
        const result = await emailProvider.send({ to: payload.recipient, ...rendered });
        await logComm(job.id, 'EMAIL', payload.recipient, payload.template, emailProvider.name, result);
        if (!result.success) throw new Error(result.error);

      } else if (job.type === 'send-sms') {
        const rendered = renderTemplate('SMS', payload.template, payload.templateData);
        const result = await smsProvider.send({ to: payload.recipient, body: rendered.body });
        await logComm(job.id, 'SMS', payload.recipient, payload.template, smsProvider.name, result);
        if (!result.success) throw new Error(result.error);

      } else if (job.type === 'send-whatsapp') {
        const rendered = renderTemplate('WHATSAPP', payload.template, payload.templateData);
        const result = await whatsappProvider.send({ 
          to: payload.recipient, 
          templateName: rendered.whatsappTemplateName || payload.template,
          components: rendered.whatsappComponents
        });
        await logComm(job.id, 'WHATSAPP', payload.recipient, payload.template, whatsappProvider.name, result);
        
        if (!result.success) {
          if (result.status === 'PERMANENT_FAILURE') {
            await handleFailover(job, 'sms');
          }
          throw new Error(result.error);
        }

      } else if (job.type === 'send-telegram') {
        const rendered = renderTemplate('TELEGRAM', payload.template, payload.templateData);
        const result = await telegramProvider.send({ chatId: payload.recipient, text: rendered.body });
        await logComm(job.id, 'TELEGRAM', payload.recipient, payload.template, telegramProvider.name, result);
        
        if (!result.success) {
          if (result.status === 'PERMANENT_FAILURE') {
            await handleFailover(job, 'sms'); // Or whatever the fallback is
          }
          throw new Error(result.error);
        }

      } else {
        throw new Error(`Unknown job type: ${job.type}`);
      }

      await completeJob(job.id);
      processed++;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      // failJob handles marking as DEAD_LETTER or RETRYING
      await failJob(job.id, e.message);
      failedCount++;
    }
  }

  return { processed, failedCount };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleFailover(failedJob: any, fallbackChannel: 'sms' | 'email') {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = failedJob.payload as any;
  // Determine new queue
  const queue = fallbackChannel === 'sms' 
    ? (failedJob.priority === 'CRITICAL' ? 'sms-critical' : 'sms-default')
    : (failedJob.priority === 'CRITICAL' ? 'email-critical' : 'email-default');

  // Enqueue a completely new job for the fallback channel with same template data
  await enqueueJob({
    type: `send-${fallbackChannel}`,
    queue,
    priority: failedJob.priority,
    payload: {
      recipient: payload.fallbackRecipient || payload.recipient, // Must provide fallbackRecipient if channels use different identifiers!
      template: payload.template,
      templateData: payload.templateData,
    },
    // We append -fallback to avoid idempotency key collisions
    idempotencyKey: failedJob.idempotencyKey ? `${failedJob.idempotencyKey}-fallback-${fallbackChannel}` : undefined,
  });

  // Notice we don't throw inside handleFailover, we just spawn the fallback job.
  // The original job will still be marked as FAILED/DEAD_LETTER because of the thrown error above it.
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logComm(jobId: string, channel: any, recipient: string, template: string, provider: string, result: any) {
  let masked = recipient;
  if (channel === 'EMAIL') {
    const [u, d] = recipient.split('@');
    masked = d ? `${u.substring(0,1)}***@${d}` : recipient;
  } else if (channel === 'SMS' || channel === 'WHATSAPP') {
    masked = recipient.length > 5 ? `${recipient.substring(0, 3)}***${recipient.substring(recipient.length - 3)}` : recipient;
  } else if (channel === 'TELEGRAM') {
    masked = `tg_***${recipient.substring(recipient.length - 3)}`;
  }

  await db.communicationLog.create({
    data: {
      jobId,
      channel,
      recipient: masked,
      template,
      provider,
      status: result.success ? (result.status || 'SENT') : 'FAILED',
      providerMessageId: result.messageId,
      errorReason: result.error,
    }
  });
}
