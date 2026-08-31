import { enqueueJob } from '@/lib/jobs/db';
import { JobPriority, CommunicationChannel } from '@/generated/prisma';

export interface SendNotificationOptions {
  recipient: string;
  channel: CommunicationChannel;
  template: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  priority?: JobPriority;
  idempotencyKey?: string;
}

export const NotificationService = {
  async dispatch(options: SendNotificationOptions) {
    const queue = options.channel === 'EMAIL' 
      ? (options.priority === 'CRITICAL' ? 'email-critical' : 'email-default')
      : (options.priority === 'CRITICAL' ? `${options.channel.toLowerCase()}-critical` : `${options.channel.toLowerCase()}-default`);
    
    const job = await enqueueJob({
      type: `send-${options.channel.toLowerCase()}`,
      queue,
      priority: options.priority || 'NORMAL',
      payload: {
        recipient: options.recipient,
        template: options.template,
        templateData: options.payload,
      },
      idempotencyKey: options.idempotencyKey,
    });

    // Immediate Worker Trigger for Critical Jobs
    // We do not await this, to let the current request respond immediately.
    if (options.priority === 'CRITICAL' && process.env.NEXT_PUBLIC_APP_URL) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/process-jobs`, {
        headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET || ''}` }
      }).catch(err => console.error('Failed to wake worker immediately:', err));
    }

    return job;
  },

  async sendLoginOtp(recipient: string, otp: string, channel: CommunicationChannel = 'SMS', lang: string = 'EN') {
    return this.dispatch({
      recipient,
      channel,
      template: 'auth.login_otp',
      payload: { otp, lang, locale: lang },
      priority: 'CRITICAL', // OTPs are critical
    });
  },

  async sendPasswordReset(email: string, token: string, lang: string = 'EN') {
    return this.dispatch({
      recipient: email,
      channel: 'EMAIL',
      template: 'auth.password_reset',
      payload: { token, lang, locale: lang },
      priority: 'CRITICAL', 
    });
  },

  async sendWelcome(email: string, name: string, lang: string = 'EN') {
    return this.dispatch({
      recipient: email,
      channel: 'EMAIL',
      template: 'auth.welcome',
      payload: { name, lang, locale: lang },
      priority: 'NORMAL',
    });
  }
};
