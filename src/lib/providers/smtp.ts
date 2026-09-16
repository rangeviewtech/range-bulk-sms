import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

export const SmtpProvider = {
  async send(to: string, subject: string, html: string) {
    if (!process.env.SMTP_HOST) {
      throw new Error('SMTP is not configured.');
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
      },
    });

    try {
      const info = await transporter.sendMail({
        from:
          process.env.SMTP_FROM || process.env.SMTP_FROM_EMAIL || '\"App\" <noreply@example.com>',
        to,
        subject,
        html,
      });

      return { success: true, messageId: info.messageId };
    } catch (err: unknown) {
      logger.error('SMTP Error', { error: err instanceof Error ? err.message : 'Provider error' });
      throw err;
    }
  },
};
