import { prisma, PrismaTransactionClient } from '@/lib/prisma';
import { JobPriority, CommunicationChannel, Prisma } from '@/generated/prisma';
import { NotificationPreferencesService } from './preferences';
import { enqueueJob } from '@/lib/jobs/db';

export const NotificationEngine = {
  /**
   * Central dispatcher for all user notifications.
   * Owns the routing logic to different channels based on user preferences.
   */
  async dispatch(
    userId: string,
    category: string,
    template: string,
    payload: Prisma.InputJsonObject,
    priority: JobPriority = 'NORMAL',
    idempotencyKey?: string,
    tx?: PrismaTransactionClient | Prisma.TransactionClient
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true, telegramChatId: true, whatsappConsent: true },
    });
    if (!user) throw new Error('User not found');

    const channels = await NotificationPreferencesService.getAllowedChannels(userId, category, [
      'EMAIL',
      'SMS',
      'IN_APP',
      'WHATSAPP',
      'TELEGRAM',
    ]);

    const jobs = [];

    if (channels.includes('EMAIL') && user.email) {
      jobs.push(await this.sendEmail(user.email, template, payload, priority, idempotencyKey, tx));
    }
    if (channels.includes('SMS') && user.phone) {
      jobs.push(await this.sendSMS(user.phone, template, payload, priority, idempotencyKey, tx));
    }
    if (channels.includes('IN_APP')) {
      jobs.push(
        await this.sendInApp(userId, category, template, payload, priority, idempotencyKey, tx)
      );
    }
    // Telegram & WhatsApp require verified associations, which might be in a user profile or separate table.
    // For this example we assume the phone number is used for WhatsApp

    if (channels.includes('WHATSAPP') && user.phone && user.whatsappConsent) {
      jobs.push(await this.sendWhatsApp(user.phone, template, payload, priority, idempotencyKey, tx));
    }

    if (channels.includes('TELEGRAM') && user.telegramChatId) {
      jobs.push(
        await this.sendTelegram(user.telegramChatId, template, payload, priority, idempotencyKey, tx)
      );
    }
    return jobs;
  },

  /**
   * Raw dispatch that bypasses user preference lookups.
   * Useful for Auth OTPs and Welcome emails where preferences aren't applicable yet.
   */
  async dispatchRaw(
    channel: CommunicationChannel,
    recipient: string,
    template: string,
    payload: Prisma.InputJsonObject,
    priority: JobPriority = 'NORMAL',
    idempotencyKey?: string,
    tx?: PrismaTransactionClient | Prisma.TransactionClient
  ) {
    if (channel === 'EMAIL') {
      return this.sendEmail(recipient, template, payload, priority, idempotencyKey, tx);
    } else if (channel === 'SMS') {
      return this.sendSMS(recipient, template, payload, priority, idempotencyKey, tx);
    } else if (channel === 'TELEGRAM') {
      return this.sendTelegram(recipient, template, payload, priority, idempotencyKey, tx);
    } else if (channel === 'WHATSAPP') {
      return this.sendWhatsApp(recipient, template, payload, priority, idempotencyKey, tx);
    } else if (channel === 'IN_APP') {
      return this.sendInApp(recipient, 'SYSTEM', template, payload, priority, idempotencyKey, tx);
    }
    throw new Error('Unsupported channel');
  },
  async sendEmail(
    recipient: string,
    template: string,
    payload: Prisma.InputJsonObject,
    priority: JobPriority = 'NORMAL',
    idempotencyKey?: string,
    tx?: PrismaTransactionClient | Prisma.TransactionClient
  ) {
    return enqueueJob({
      type: 'send-email',
      queue: priority === 'CRITICAL' ? 'email-critical' : 'email-default',
      priority,
      payload: { recipient, template, templateData: payload },
      idempotencyKey: idempotencyKey
        ? JSON.stringify([idempotencyKey, 'EMAIL', recipient])
        : undefined,
      tx,
    });
  },
  async sendSMS(
    recipient: string,
    template: string,
    payload: Prisma.InputJsonObject,
    priority: JobPriority = 'NORMAL',
    idempotencyKey?: string,
    tx?: PrismaTransactionClient | Prisma.TransactionClient
  ) {
    return enqueueJob({
      type: 'send-sms',
      queue: priority === 'CRITICAL' ? 'sms-critical' : 'sms-default',
      priority,
      payload: { recipient, template, templateData: payload },
      idempotencyKey: idempotencyKey
        ? JSON.stringify([idempotencyKey, 'SMS', recipient])
        : undefined,
      tx,
    });
  },
  async sendTelegram(
    recipient: string,
    template: string,
    payload: Prisma.InputJsonObject,
    priority: JobPriority = 'NORMAL',
    idempotencyKey?: string,
    tx?: PrismaTransactionClient | Prisma.TransactionClient
  ) {
    return enqueueJob({
      type: 'send-telegram',
      queue: priority === 'CRITICAL' ? 'telegram-critical' : 'telegram-default',
      priority,
      payload: { recipient, template, templateData: payload },
      idempotencyKey: idempotencyKey
        ? JSON.stringify([idempotencyKey, 'TELEGRAM', recipient])
        : undefined,
      tx,
    });
  },
  async sendWhatsApp(
    recipient: string,
    template: string,
    payload: Prisma.InputJsonObject,
    priority: JobPriority = 'NORMAL',
    idempotencyKey?: string,
    tx?: PrismaTransactionClient | Prisma.TransactionClient
  ) {
    return enqueueJob({
      type: 'send-whatsapp',
      queue: priority === 'CRITICAL' ? 'whatsapp-critical' : 'whatsapp-default',
      priority,
      payload: { recipient, template, templateData: payload },
      idempotencyKey: idempotencyKey
        ? JSON.stringify([idempotencyKey, 'WHATSAPP', recipient])
        : undefined,
      tx,
    });
  },
  async sendInApp(
    userId: string,
    category: string,
    template: string,
    payload: Prisma.InputJsonObject,
    priority: JobPriority = 'NORMAL',
    idempotencyKey?: string,
    tx?: PrismaTransactionClient | Prisma.TransactionClient
  ) {
    return enqueueJob({
      type: 'send-in-app',
      queue: 'system',
      priority,
      payload: { recipient: userId, template, templateData: payload, category },
      idempotencyKey: idempotencyKey
        ? JSON.stringify([idempotencyKey, 'IN_APP', userId])
        : undefined,
      tx,
    });
  },
};
