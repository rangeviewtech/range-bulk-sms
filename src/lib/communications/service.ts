import { after } from 'next/server';
import { JobPriority, CommunicationChannel, Prisma } from '@/generated/prisma';
import { NotificationEngine } from '@/lib/notifications';

export interface SendNotificationOptions {
  recipient: string;
  channel: CommunicationChannel;
  template: string;
  payload: Prisma.InputJsonObject;
  priority?: JobPriority;
  idempotencyKey?: string;
  tx?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const NotificationService = {
  async dispatch(options: SendNotificationOptions) {
    const job = await NotificationEngine.dispatchRaw(
      options.channel,
      options.recipient,
      options.template,
      options.payload,
      options.priority,
      options.idempotencyKey,
      options.tx
    );

    // Immediate Worker Trigger for Critical Jobs
    if (options.priority === 'CRITICAL' && process.env.NEXT_PUBLIC_APP_URL) {
      after(async () => {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/process-jobs`, {
          signal: AbortSignal.timeout(10_000),
          headers: { Authorization: `Bearer ${process.env.CRON_SECRET || ''}` },
        }).catch(() => console.error('Failed to wake notification worker'));
      });
    }

    return job;
  },

  async sendLoginOtp(
    recipient: string,
    otp: string,
    channel: CommunicationChannel = 'SMS',
    lang: string = 'EN',
    tx?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {
    return this.dispatch({
      recipient,
      channel,
      template: 'auth.login_otp',
      payload: { otp, lang, locale: lang },
      priority: 'CRITICAL',
      tx,
    });
  },

  async sendPasswordReset(
    email: string, 
    token: string, 
    lang: string = 'EN',
    tx?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {
    return this.dispatch({
      recipient: email,
      channel: 'EMAIL',
      template: 'auth.password_reset',
      payload: { token, lang, locale: lang },
      priority: 'CRITICAL',
      tx,
    });
  },

  async sendWelcome(
    email: string, 
    name: string, 
    lang: string = 'EN',
    tx?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {
    return this.dispatch({
      recipient: email,
      channel: 'EMAIL',
      template: 'auth.welcome',
      payload: { name, lang, locale: lang },
      priority: 'NORMAL',
      tx,
    });
  },

  async sendPasswordChanged(
    email: string, 
    name: string = 'User', 
    lang: string = 'EN',
    tx?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {
    return this.dispatch({
      recipient: email,
      channel: 'EMAIL',
      template: 'auth.password_changed',
      payload: { name, lang, locale: lang },
      priority: 'CRITICAL',
      tx,
    });
  },
};
